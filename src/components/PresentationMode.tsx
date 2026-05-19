import { useState, useEffect, useCallback, useRef } from "react";
import type { Song } from "../types/song.types";
import { buildBilingualLines } from "../utils/transliterate-telugu";
import { transliterateLine } from "../utils/transliterate-telugu";

interface Slide {
  type: "verse" | "refrain";
  label: string;
  text: string;
  verseNum?: number;
}

function buildSlides(song: Song): Slide[] {
  const slides: Slide[] = [];
  const chorus = song.stanzas.find((s) => s.is_chorus);
  const verses = song.stanzas.filter((s) => !s.is_chorus);

  if (song.has_chorus && chorus) {
    verses.forEach((v, i) => {
      slides.push({
        type: "verse",
        label: `Verse ${i + 1}`,
        text: v.text,
        verseNum: i + 1,
      });
      slides.push({ type: "refrain", label: "Refrain", text: chorus.text });
    });
  } else {
    song.stanzas.forEach((v, i) => {
      slides.push({
        type: v.is_chorus ? "refrain" : "verse",
        label: v.is_chorus ? "Refrain" : `Verse ${i + 1}`,
        text: v.text,
        verseNum: v.is_chorus ? undefined : i + 1,
      });
    });
  }
  return slides;
}

const FS_KEY = "sda_lyrics_fontsize";
const TS_KEY = "sda_title_fontsize";
const DEFAULT_LYRICS = 48;
const DEFAULT_TITLE = 42;

export default function PresentationMode({
  song,
  onClose,
}: {
  song: Song;
  onClose: () => void;
}) {
  const slides = buildSlides(song);
  const [current, setCurrent] = useState(0);
  const [lyricsSize, setLyricsSize] = useState(
    () => Number(localStorage.getItem(FS_KEY)) || DEFAULT_LYRICS,
  );
  const [titleSize, setTitleSize] = useState(
    () => Number(localStorage.getItem(TS_KEY)) || DEFAULT_TITLE,
  );
  const [showHint, setShowHint] = useState(true);
  const [showControls, setShowControls] = useState(false); // briefly visible on hover/tap
  const controlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef({ x: 0, y: 0 });

  const next = useCallback(
    () => setCurrent((c) => Math.min(slides.length - 1, c + 1)),
    [slides.length],
  );
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  // Persist font sizes
  useEffect(() => {
    localStorage.setItem(FS_KEY, String(lyricsSize));
  }, [lyricsSize]);
  useEffect(() => {
    localStorage.setItem(TS_KEY, String(titleSize));
  }, [titleSize]);

  // Hide hint after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  // Show controls briefly on mouse move (auto-hide after 2.5s)
  const flashControls = useCallback(() => {
    setShowControls(true);
    if (controlTimer.current) clearTimeout(controlTimer.current);
    controlTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      flashControls();
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === " " ||
        e.key === "PageDown"
      ) {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape") onClose();
      if (e.key === "Home") setCurrent(0);
      if (e.key === "End") setCurrent(slides.length - 1);

      // Font — Ctrl +/-/0
      if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setLyricsSize((s) => Math.min(s + 3, 120));
        setTitleSize((s) => Math.min(s + 2, 100));
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        setLyricsSize((s) => Math.max(s - 3, 18));
        setTitleSize((s) => Math.max(s - 2, 16));
      }
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        setLyricsSize(DEFAULT_LYRICS);
        setTitleSize(DEFAULT_TITLE);
      }

      // Jump to verse 1–9
      if (!e.ctrlKey && !e.altKey && e.key >= "1" && e.key <= "9") {
        const idx = slides.findIndex((s) => s.verseNum === parseInt(e.key));
        if (idx > -1) setCurrent(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose, slides, flashControls]);

  // Auto landscape + fullscreen
  useEffect(() => {
    const enter = async () => {
      try {
        await document.documentElement.requestFullscreen?.();
      } catch {}
      try {
        await (screen.orientation as any)?.lock?.("landscape");
      } catch {}
    };
    enter();
    return () => {
      try {
        (screen.orientation as any)?.unlock?.();
      } catch {}
      try {
        if (document.fullscreenElement) document.exitFullscreen?.();
      } catch {}
    };
  }, []);

  const slide = slides[current];
  const isTelugu = song.lang === "te";
  const lyricsFont = isTelugu
    ? "'Noto Sans Telugu', sans-serif"
    : "'Georgia', serif";
  const titleFont = isTelugu
    ? "'Noto Sans Telugu', sans-serif"
    : "'Georgia', serif";
  const progressPct =
    slides.length > 1 ? ((current + 1) / slides.length) * 100 : 100;

  return (
    <div
      className="pr"
      onClick={next}
      onMouseMove={flashControls}
      onTouchStart={(e) => {
        touchStart.current = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
        };
        flashControls();
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          dx < 0 ? next() : prev();
        }
      }}
    >
      {/* ── OVERLAY CONTROLS (auto-hide) ─────────────── */}
      <div className={`pr-overlay ${showControls ? "visible" : ""}`}>
        {/* Close — top left */}
        <button
          className="pr-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close (Esc)"
          aria-label="Close presentation"
        >
          {/* X icon SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Slide counter — top centre */}
        <div className="pr-counter">
          {/* Dots for small counts, number for large */}
          {slides.length <= 12 ? (
            <div className="pr-dots">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`pr-dot ${i === current ? "active" : ""} ${slides[i].type === "refrain" ? "refrain" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(i);
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="pr-num">
              {current + 1} <span style={{ opacity: 0.4 }}>/</span>{" "}
              {slides.length}
            </span>
          )}
        </div>

        {/* Font controls — top right */}
        <div className="pr-font-ctrl" onClick={(e) => e.stopPropagation()}>
          {/* Decrease */}
          <button
            className="pr-icon-btn"
            onClick={() => {
              setLyricsSize((s) => Math.max(s - 3, 18));
              setTitleSize((s) => Math.max(s - 2, 16));
            }}
            title="Smaller font (Ctrl −)"
            aria-label="Decrease font size"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {/* Reset */}
          <button
            className="pr-icon-btn"
            onClick={() => {
              setLyricsSize(DEFAULT_LYRICS);
              setTitleSize(DEFAULT_TITLE);
            }}
            title="Reset font size (Ctrl 0)"
            aria-label="Reset font size"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          {/* Increase */}
          <button
            className="pr-icon-btn"
            onClick={() => {
              setLyricsSize((s) => Math.min(s + 3, 120));
              setTitleSize((s) => Math.min(s + 2, 100));
            }}
            title="Larger font (Ctrl +)"
            aria-label="Increase font size"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── SLIDE CONTENT ──────────────────────────── */}
      <div className="pr-slide">
        <h1
          className="pr-title"
          style={{ fontFamily: titleFont, fontSize: `${titleSize}px` }}
        >
          {song.title}
        </h1>
        <h2 className={`pr-label ${slide.type === "refrain" ? "refrain" : ""}`}>
          {slide.label}
        </h2>
        <p
          className={`pr-lyrics ${slide.type === "refrain" ? "refrain" : ""}`}
          style={{
            fontFamily: lyricsFont,
            fontSize: `${lyricsSize}px`,
            lineHeight: isTelugu ? 1.9 : 1.35,
          }}
        >
          import {buildBilingualLines} from '../utils/transliterate-telugu' //
          In the slide content section, replace the lyrics rendering with:
          {slide.text.split("\n").map((line, idx, arr) => {
            const isTeluguLine = isTelugu && line.trim();
            const translit = isTelugu ? transliterateLine(line) : "";

            return (
              <span key={idx}>
                {/* Telugu line */}
                {line || "\u00A0"}
                {/* Transliteration — every line, below Telugu */}
                {isTeluguLine && translit && (
                  <>
                    <br />
                    <span
                      style={{
                        fontSize: `${Math.round(lyricsSize * 0.55)}px`,
                        color:
                          slide.type === "refrain"
                            ? "rgba(253,230,138,0.55)"
                            : "rgba(255,255,255,0.38)",
                        fontStyle: "italic",
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {translit}
                    </span>
                  </>
                )}
                {idx < arr.length - 1 && <br />}
              </span>
            );
          })}
        </p>
      </div>

      {/* ── PROGRESS BAR ───────────────────────────── */}
      <div className="pr-progress">
        <div
          className="pr-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── FIRST-USE HINT ─────────────────────────── */}
      {showHint && (
        <div className="pr-hint">
          <span>← →</span> navigate &nbsp;·&nbsp;
          <span>1 – 9</span> jump verse &nbsp;·&nbsp;
          <span>Ctrl ±</span> font size &nbsp;·&nbsp;
          <span>Esc</span> close
        </div>
      )}

      <style>{`
        /* Root */
        .pr {
          position: fixed; inset: 0;
          background: #000;
          z-index: 1000;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: none;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .pr:hover { cursor: default; }

        /* Overlay (auto-hide) */
        .pr-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: flex-start;
          justify-content: space-between;
          padding: 18px 20px;
          z-index: 10;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .pr-overlay.visible { opacity: 1; pointer-events: auto; }

        /* Close button */
        .pr-close {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          backdrop-filter: blur(8px);
        }
        .pr-close:hover {
          background: rgba(239,68,68,0.25);
          border-color: rgba(239,68,68,0.4);
          color: #FCA5A5;
          transform: scale(1.05);
        }

        /* Counter / dots */
        .pr-counter {
          display: flex; align-items: center; justify-content: center;
          flex: 1; padding: 0 1rem;
        }
        .pr-dots {
          display: flex; gap: 7px; align-items: center;
        }
        .pr-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.25s;
        }
        .pr-dot.active {
          background: rgba(255,255,255,0.85);
          transform: scale(1.25);
        }
        .pr-dot.refrain.active {
          background: #FDE68A;
        }
        .pr-dot.refrain {
          background: rgba(253,230,138,0.25);
          border-radius: 2px;
          width: 9px; height: 7px;
        }
        .pr-num {
          color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; letter-spacing: 0.06em;
        }

        /* Font controls */
        .pr-font-ctrl {
          display: flex; gap: 6px; align-items: center;
        }
        .pr-icon-btn {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          backdrop-filter: blur(8px);
        }
        .pr-icon-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
          transform: scale(1.05);
        }
        .pr-icon-btn:active { transform: scale(0.95); }

        /* Slide */
        .pr-slide {
          width: 100%; max-width: 1400px;
          padding: 80px 7vw 56px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          flex: 1;
        }

        /* Title */
        .pr-title {
          color: rgba(255,255,255,0.88);
          font-weight: 400;
          line-height: 1.2;
          margin: 0 0 0.9rem 0;
          letter-spacing: -0.01em;
        }

        /* Label */
        .pr-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.4vw, 16px);
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 2rem 0;
        }
        .pr-label.refrain {
          color: rgba(253,230,138,0.6);
          letter-spacing: 0.18em;
        }

        /* Lyrics */
        .pr-lyrics {
          color: #FFFFFF;
          font-weight: 400;
          margin: 0;
          max-width: 1200px;
          width: 100%;
        }
        .pr-lyrics.refrain {
          color: #FEF3C7;
          font-style: italic;
        }

        /* Progress bar */
        .pr-progress {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px;
          background: rgba(255,255,255,0.06);
          z-index: 5;
        }
        .pr-progress-fill {
          height: 100%;
          background: rgba(255,255,255,0.5);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Hint */
        .pr-hint {
          position: absolute; bottom: 22px;
          left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; letter-spacing: 0.04em;
          animation: hintFade 3.5s forwards;
          pointer-events: none; white-space: nowrap;
        }
        .pr-hint span {
          color: rgba(255,255,255,0.55);
          font-weight: 600;
        }

        @keyframes hintFade {
          0%, 55% { opacity: 1; }
          100% { opacity: 0; }
        }

        @media (max-width: 600px) {
          .pr-slide { padding: 72px 5vw 48px; }
          .pr-icon-btn, .pr-close { width: 36px; height: 36px; }
        }
      `}</style>
    </div>
  );
}
