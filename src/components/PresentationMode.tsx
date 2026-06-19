import { useState, useEffect, useCallback, useRef } from "react";
import type { Song } from "../types/song.types";
import { transliterateLine } from "../utils/transliterate-telugu";

// ── Slide = 3 Telugu lines + their transliterations ───────────────────────
interface Slide {
  type: "title" | "lyrics" | "chorus";
  lines: string[]; // Telugu lines (or English for non-Telugu songs)
  translitLines: string[]; // English transliteration (Telugu songs only)
  label?: string;
  verseNum?: number;
}

const LINES_PER_SLIDE = 3;

function buildSlides(song: Song): Slide[] {
  const slides: Slide[] = [];
  const isTelugu = song.lang === "te";

  // Title slide
  slides.push({
    type: "title",
    lines: [song.title],
    translitLines: isTelugu ? [transliterateLine(song.title)] : [],
  });

  const chorus = song.stanzas.find((s) => s.is_chorus);
  const verses = song.stanzas.filter((s) => !s.is_chorus);

  function stanzaToSlides(
    text: string,
    type: "lyrics" | "chorus",
    label: string,
    verseNum?: number,
  ) {
    const lines = text.split("\n").filter((l) => l.trim());
    // Split into groups of LINES_PER_SLIDE
    for (let i = 0; i < lines.length; i += LINES_PER_SLIDE) {
      const chunk = lines.slice(i, i + LINES_PER_SLIDE);
      slides.push({
        type,
        lines: chunk,
        translitLines: isTelugu ? chunk.map((l) => transliterateLine(l)) : [],
        label,
        verseNum,
      });
    }
  }

  if (song.has_chorus && chorus) {
    verses.forEach((v, i) => {
      stanzaToSlides(v.text, "lyrics", `Verse ${i + 1}`, i + 1);
      stanzaToSlides(chorus.text, "chorus", "Refrain");
    });
  } else {
    song.stanzas.forEach((v, i) => {
      stanzaToSlides(
        v.text,
        v.is_chorus ? "chorus" : "lyrics",
        v.is_chorus ? "Refrain" : `Verse ${i + 1}`,
        v.is_chorus ? undefined : i + 1,
      );
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
  const isTelugu = song.lang === "te";
  const [current, setCurrent] = useState(0);
  const [lyricsSize, setLyricsSize] = useState(
    () => Number(localStorage.getItem(FS_KEY)) || DEFAULT_LYRICS,
  );
  const [titleSize, setTitleSize] = useState(
    () => Number(localStorage.getItem(TS_KEY)) || DEFAULT_TITLE,
  );
  const [showHint, setShowHint] = useState(true);
  const [showCtrl, setShowCtrl] = useState(false);
  const ctrlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef({ x: 0, y: 0 });

  const next = useCallback(
    () => setCurrent((c) => Math.min(slides.length - 1, c + 1)),
    [slides.length],
  );
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  useEffect(() => {
    localStorage.setItem(FS_KEY, String(lyricsSize));
  }, [lyricsSize]);
  useEffect(() => {
    localStorage.setItem(TS_KEY, String(titleSize));
  }, [titleSize]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const flashCtrl = useCallback(() => {
    setShowCtrl(true);
    if (ctrlTimer.current) clearTimeout(ctrlTimer.current);
    ctrlTimer.current = setTimeout(() => setShowCtrl(false), 2500);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      flashCtrl();
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
      if (!e.ctrlKey && e.key >= "1" && e.key <= "9") {
        const idx = slides.findIndex((s) => s.verseNum === parseInt(e.key));
        if (idx > -1) setCurrent(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose, slides, flashCtrl]);

  useEffect(() => {
    const go = async () => {
      try {
        await document.documentElement.requestFullscreen?.();
      } catch {}
      try {
        await (screen.orientation as any)?.lock?.("landscape");
      } catch {}
    };
    go();
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
  const progressPct =
    slides.length > 1 ? ((current + 1) / slides.length) * 100 : 100;

  // Telugu font — same as PPT
  const teluguFont = "'Noto Sans Telugu', sans-serif";
  const titleFont = "'Cambria', 'Georgia', serif";

  return (
    <div
      className="pr-root"
      onClick={next}
      onMouseMove={flashCtrl}
      onTouchStart={(e) => {
        touchStart.current = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
        };
        flashCtrl();
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          dx < 0 ? next() : prev();
        }
      }}
    >
      {/* ── CONTROLS (auto-hide) ─────────────────────── */}
      <div className={`pr-controls ${showCtrl ? "visible" : ""}`}>
        <button
          className="pr-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close (Esc)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="pr-slide-dots">
          {slides.length <= 14 ? (
            slides.map((_, i) => (
              <div
                key={i}
                className={`pr-dot ${i === current ? "active" : ""} ${slides[i].type === "chorus" ? "chorus" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
              />
            ))
          ) : (
            <span className="pr-slide-num">
              {current + 1} / {slides.length}
            </span>
          )}
        </div>

        <div className="pr-font-btns" onClick={(e) => e.stopPropagation()}>
          <button
            className="pr-icon-btn"
            onClick={() => {
              setLyricsSize((s) => Math.max(s - 3, 18));
              setTitleSize((s) => Math.max(s - 2, 16));
            }}
            title="Smaller (Ctrl−)"
          >
            <svg
              width="14"
              height="14"
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
          <button
            className="pr-icon-btn"
            onClick={() => {
              setLyricsSize(DEFAULT_LYRICS);
              setTitleSize(DEFAULT_TITLE);
            }}
            title="Reset (Ctrl 0)"
          >
            <svg
              width="14"
              height="14"
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
          <button
            className="pr-icon-btn"
            onClick={() => {
              setLyricsSize((s) => Math.min(s + 3, 120));
              setTitleSize((s) => Math.min(s + 2, 100));
            }}
            title="Larger (Ctrl+)"
          >
            <svg
              width="14"
              height="14"
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

      {/* ── SLIDE CONTENT ────────────────────────────── */}
      <div className="pr-slide">
        {slide.type === "title" ? (
          /* ── TITLE SLIDE ── */
          <div className="pr-title-slide">
            <div
              className="pr-title-text"
              style={{
                fontFamily: isTelugu ? teluguFont : titleFont,
                fontSize: `${titleSize + 20}px`,
              }}
            >
              {slide.lines[0]}
            </div>
            {isTelugu && slide.translitLines[0] && (
              <div
                className="pr-title-translit"
                style={{ fontSize: `${titleSize}px` }}
              >
                {slide.translitLines[0]}
              </div>
            )}
            <div className="pr-hint-text">tap · swipe · arrow keys</div>
          </div>
        ) : (
          /* ── LYRICS SLIDE ── */
          <div className="pr-lyrics-slide">
            {slide.lines.map((line, i) => (
              <div key={i} className="pr-line-pair">
                {/* Telugu / main lyrics */}
                <div
                  className={`pr-line-main ${slide.type === "chorus" ? "chorus" : ""}`}
                  style={{
                    fontFamily: isTelugu ? teluguFont : titleFont,
                    fontSize: `${lyricsSize}px`,
                  }}
                >
                  {line}
                </div>
                {/* English transliteration — only for Telugu songs */}
                {isTelugu && slide.translitLines[i] && (
                  <div
                    className="pr-line-translit"
                    style={{ fontSize: `${Math.round(lyricsSize * 0.6)}px` }}
                  >
                    {slide.translitLines[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PROGRESS BAR ─────────────────────────────── */}
      <div className="pr-progress">
        <div
          className="pr-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── SWIPE HINT ───────────────────────────────── */}
      {showHint && current === 0 && (
        <div className="pr-swipe-hint">tap or swipe to advance</div>
      )}

      <style>{`
        .pr-root {
          position: fixed; inset: 0; z-index: 1000;
          background: linear-gradient(160deg, #FFFFFF 0%, #F0F0F0 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: default;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        /* Controls overlay */
        .pr-controls {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          z-index: 10; pointer-events: none;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .pr-controls.visible { opacity: 1; pointer-events: auto; }

        .pr-close-btn {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.12);
          color: rgba(0,0,0,0.5);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .pr-close-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #DC2626;
        }

        .pr-slide-dots {
          display: flex; gap: 6px; align-items: center;
        }
        .pr-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(0,0,0,0.15); cursor: pointer;
          transition: all 0.2s;
        }
        .pr-dot.active { background: #2E3A6B; transform: scale(1.3); }
        .pr-dot.chorus.active { background: #E85C00; }
        .pr-dot.chorus { background: rgba(232,92,0,0.2); }
        .pr-slide-num {
          color: rgba(0,0,0,0.35); font-family: 'DM Sans', sans-serif; font-size: 13px;
        }

        .pr-font-btns { display: flex; gap: 6px; }
        .pr-icon-btn {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.5);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .pr-icon-btn:hover { background: rgba(0,0,0,0.12); color: rgba(0,0,0,0.8); }

        /* Slide content */
        .pr-slide {
          width: 100%; flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 60px 8vw 48px;
        }

        /* Title slide */
        .pr-title-slide {
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .pr-title-text {
          color: #2E3A6B;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .pr-title-translit {
          color: #5A6A8A;
          font-family: 'Cambria', 'Georgia', serif;
          font-weight: 400;
          font-style: italic;
          line-height: 1.4;
        }
        .pr-hint-text {
          margin-top: 2rem;
          color: rgba(0,0,0,0.2);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; letter-spacing: 0.06em;
        }

        /* Lyrics slide */
        .pr-lyrics-slide {
          width: 100%; max-width: 1200px;
          display: flex; flex-direction: column;
          gap: 1.5rem;
        }

        /* Line pair: Telugu + transliteration */
        .pr-line-pair {
          display: flex; flex-direction: column; gap: 4px;
        }

        .pr-line-main {
          color: #1E2761;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: 0.01em;
        }
        .pr-line-main.chorus {
          color: #B84000;
        }

        .pr-line-translit {
          color: #5A6A8A;
          font-family: 'Cambria', 'Georgia', serif;
          font-weight: 400;
          font-style: italic;
          line-height: 1.4;
          padding-left: 4px;
        }
        .pr-line-main.chorus + .pr-line-translit {
          color: #C05A20;
        }

        /* Progress bar */
        .pr-progress {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: rgba(0,0,0,0.06); z-index: 5;
        }
        .pr-progress-fill {
          height: 100%; background: #2E3A6B;
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        /* Swipe hint */
        .pr-swipe-hint {
          position: absolute; bottom: 18px;
          left: 50%; transform: translateX(-50%);
          color: rgba(0,0,0,0.25);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; letter-spacing: 0.05em;
          animation: hintFade 4s forwards;
          pointer-events: none; white-space: nowrap;
        }
        @keyframes hintFade { 0%,60%{opacity:1} 100%{opacity:0} }

        @media (max-width: 600px) {
          .pr-slide { padding: 56px 5vw 44px; }
          .pr-lyrics-slide { gap: 1rem; }
        }
      `}</style>
    </div>
  );
}
