import { useState, useEffect, useCallback, useRef } from "react";
import type { Song } from "../types/song.types";
import { transliterateLine } from "../utils/transliterate-telugu";
import { useTheme } from "../contexts/ThemeContext";

interface Slide {
  type: "title" | "verse" | "refrain";
  label: string;
  text: string;
  verseNum?: number;
}

function buildSlides(song: Song): Slide[] {
  const slides: Slide[] = [];

  // Title slide
  slides.push({ type: "title", label: song.num, text: song.title });

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
const DEFAULT_LYRICS = 36;
const DEFAULT_TITLE = 32;

export default function PresentationMode({
  song,
  onClose,
}: {
  song: Song;
  onClose: () => void;
}) {
  const slides = buildSlides(song);
  const { isDark } = useTheme();
  const isTelugu = song.lang === "te";

  const [current, setCurrent] = useState(0);
  const [lyricsSize, setLyricsSize] = useState(
    () => Number(localStorage.getItem(FS_KEY)) || DEFAULT_LYRICS,
  );
  const [titleSize, setTitleSize] = useState(
    () => Number(localStorage.getItem(TS_KEY)) || DEFAULT_TITLE,
  );
  const [showHint, setShowHint] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const controlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const flashControls = useCallback(() => {
    setShowControls(true);
    if (controlTimer.current) clearTimeout(controlTimer.current);
    controlTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      flashControls();
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) {
        e.preventDefault();
        next();
      }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape") onClose();
      if (e.key === "Home") setCurrent(0);
      if (e.key === "End") setCurrent(slides.length - 1);
      if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setLyricsSize((s) => Math.min(s + 2, 80));
        setTitleSize((s) => Math.min(s + 2, 72));
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        setLyricsSize((s) => Math.max(s - 2, 14));
        setTitleSize((s) => Math.max(s - 2, 14));
      }
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        setLyricsSize(DEFAULT_LYRICS);
        setTitleSize(DEFAULT_TITLE);
      }
      if (!e.ctrlKey && !e.altKey && e.key >= "1" && e.key <= "9") {
        const idx = slides.findIndex((s) => s.verseNum === parseInt(e.key));
        if (idx > -1) setCurrent(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose, slides, flashControls]);

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
  const progressPct =
    slides.length > 1 ? ((current + 1) / slides.length) * 100 : 100;

  // ── Theme-aware colors ──────────────────────────────────────────────────
  const bg = isDark ? "#0A0F1E" : "#FFFFFF";
  const titleColor = isDark ? "rgba(255,255,255,0.92)" : "#1E2761";
  const verseColor = isDark ? "#FFFFFF" : "#1E2761";
  const refColor = isDark ? "#FEF3C7" : "#B84000";
  const translitColor = isDark ? "rgba(255,255,255,0.42)" : "#5A6A8A";
  const translitRefColor = isDark ? "rgba(253,230,138,0.5)" : "#C05A20";
  const labelColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(30,39,97,0.4)";
  const labelRefColor = isDark ? "rgba(253,230,138,0.6)" : "#B84000";
  const btnColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)";
  const dotColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const dotActive = isDark ? "rgba(255,255,255,0.85)" : "#1E2761";
  const progressBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const progressFill = isDark ? "rgba(255,255,255,0.5)" : "#1E2761";
  const hintColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)";
  const hintSpanColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";

  const teluguFont = "'Noto Sans Telugu', sans-serif";
  const latinFont = "'Georgia', 'Crimson Pro', serif";
  const mainFont = isTelugu ? teluguFont : latinFont;

  return (
    <div
      style={{ background: bg }}
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
      {/* ── OVERLAY CONTROLS ────────────────────────── */}
      <div className={`pr-overlay ${showControls ? "visible" : ""}`}>
        {/* Close */}
        <button
          className="pr-ctrl-btn"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}`,
            color: btnColor,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close (Esc)"
        >
          <svg
            width="15"
            height="15"
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

        {/* Dots / counter */}
        <div className="pr-counter">
          {slides.length <= 14 ? (
            <div className="pr-dots">
              {slides.map((sl, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(i);
                  }}
                  style={{
                    width: i === current ? 20 : sl.type === "refrain" ? 9 : 7,
                    height: 7,
                    borderRadius: sl.type === "refrain" ? 3 : "50%",
                    background:
                      i === current
                        ? sl.type === "refrain"
                          ? "#F59E0B"
                          : dotActive
                        : sl.type === "refrain"
                          ? isDark
                            ? "rgba(253,230,138,0.25)"
                            : "rgba(184,64,0,0.2)"
                          : dotColor,
                    cursor: "pointer",
                    transition: "all 0.25s",
                  }}
                />
              ))}
            </div>
          ) : (
            <span
              style={{
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
              }}
            >
              {current + 1} / {slides.length}
            </span>
          )}
        </div>

        {/* Font controls */}
        <div
          style={{ display: "flex", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            {
              icon: (
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
              ),
              title: "Smaller (Ctrl −)",
              action: () => {
                setLyricsSize((s) => Math.max(s - 2, 14));
                setTitleSize((s) => Math.max(s - 2, 14));
              },
            },
            {
              icon: (
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
              ),
              title: "Reset (Ctrl 0)",
              action: () => {
                setLyricsSize(DEFAULT_LYRICS);
                setTitleSize(DEFAULT_TITLE);
              },
            },
            {
              icon: (
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
              ),
              title: "Larger (Ctrl +)",
              action: () => {
                setLyricsSize((s) => Math.min(s + 2, 80));
                setTitleSize((s) => Math.min(s + 2, 72));
              },
            },
          ].map((btn, i) => (
            <button
              key={i}
              className="pr-ctrl-btn"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}`,
                color: btnColor,
              }}
              onClick={btn.action}
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── SLIDE CONTENT ─────────────────────────────── */}
      <div className="pr-slide">
        {slide.type === "title" ? (
          /* Title slide */
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: mainFont,
                fontSize: `${titleSize + 16}px`,
                fontWeight: 700,
                color: titleColor,
                lineHeight: isTelugu ? 1.6 : 1.2,
                marginBottom: isTelugu ? "1rem" : "0.5rem",
              }}
            >
              {slide.text}
            </div>
            {isTelugu && (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: `${titleSize}px`,
                  color: translitColor,
                  fontStyle: "italic",
                  lineHeight: 1.4,
                }}
              >
                {transliterateLine(slide.text)}
              </div>
            )}
            <div
              style={{
                marginTop: "2.5rem",
                color: hintColor,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                letterSpacing: "0.1em",
              }}
            >
              TAP · SWIPE · ARROW KEYS · 1–9 JUMP VERSE · CTRL ± FONT
            </div>
          </div>
        ) : (
          /* Lyrics slide — full stanza */
          <div style={{ width: "100%", maxWidth: 1300 }}>
            {/* Label */}
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(11px, 1.3vw, 15px)",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: slide.type === "refrain" ? labelRefColor : labelColor,
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              {slide.label}
            </div>

            {/* Lines — Telugu + transliteration side by side (equal font size) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isTelugu ? "1rem" : "0.5rem",
              }}
            >
              {slide.text
                .split("\n")
                .filter((l) => l.trim())
                .map((line, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    {/* Main line */}
                    <div
                      style={{
                        fontFamily: mainFont,
                        fontSize: `${lyricsSize}px`,
                        fontWeight: isTelugu ? 600 : 400,
                        color: slide.type === "refrain" ? refColor : verseColor,
                        lineHeight: isTelugu ? 1.7 : 1.4,
                        fontStyle:
                          slide.type === "refrain" && !isTelugu
                            ? "italic"
                            : "normal",
                      }}
                    >
                      {line}
                    </div>
                    {/* Transliteration — SAME font size as Telugu */}
                    {isTelugu && (
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: `${lyricsSize}px`, // ← same size as Telugu
                          fontWeight: 400,
                          color:
                            slide.type === "refrain"
                              ? translitRefColor
                              : translitColor,
                          lineHeight: 1.4,
                          fontStyle: "italic",
                          marginTop: 2,
                        }}
                      >
                        {transliterateLine(line)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PROGRESS BAR ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: progressBg,
          zIndex: 5,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: progressFill,
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>

      {/* ── HINT ──────────────────────────────────────── */}
      {showHint && current === 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            color: hintColor,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            letterSpacing: "0.04em",
            animation: "prHintFade 3.5s forwards",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: hintSpanColor, fontWeight: 600 }}>← →</span>{" "}
          navigate &nbsp;·&nbsp;
          <span style={{ color: hintSpanColor, fontWeight: 600 }}>
            1–9
          </span>{" "}
          jump verse &nbsp;·&nbsp;
          <span style={{ color: hintSpanColor, fontWeight: 600 }}>
            Ctrl ±
          </span>{" "}
          font &nbsp;·&nbsp;
          <span style={{ color: hintSpanColor, fontWeight: 600 }}>
            Esc
          </span>{" "}
          close
        </div>
      )}

      <style>{`
        .pr {
          position: fixed; inset: 0; z-index: 1000;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden; cursor: default;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          transition: background 0.3s;
        }
        .pr-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: flex-start;
          justify-content: space-between;
          padding: 16px 18px; z-index: 10;
          pointer-events: none;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .pr-overlay.visible { opacity: 1; pointer-events: auto; }
        .pr-ctrl-btn {
          width: 38px; height: 38px; border-radius: 9px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .pr-ctrl-btn:hover { opacity: 0.8; transform: scale(1.05); }
        .pr-ctrl-btn:active { transform: scale(0.95); }
        .pr-counter {
          display: flex; align-items: center; justify-content: center;
          flex: 1; padding: 0 1rem;
        }
        .pr-dots { display: flex; gap: 7px; align-items: center; }
        .pr-slide {
          width: 100%; max-width: 1400px;
          padding: 72px 6vw 52px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          flex: 1;
        }
        @keyframes prHintFade {
          0%, 55% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (max-width: 600px) {
          .pr-slide { padding: 60px 4vw 44px; }
          .pr-ctrl-btn { width: 34px; height: 34px; }
        }
      `}</style>
    </div>
  );
}
