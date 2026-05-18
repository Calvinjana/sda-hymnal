import { useState, useEffect, useCallback, useRef } from "react";
import type { Song } from "../types/song.types";

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
    () => Number(localStorage.getItem(FS_KEY)) || 54,
  );
  const [titleSize, setTitleSize] = useState(
    () => Number(localStorage.getItem(TS_KEY)) || 56,
  );
  const [showHint, setShowHint] = useState(true);
  const touchStart = useRef({ x: 0, y: 0 });

  const next = useCallback(
    () => setCurrent((c) => Math.min(slides.length - 1, c + 1)),
    [slides.length],
  );
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  // Persist font sizes (like adventisthymns cookies)
  useEffect(() => {
    localStorage.setItem(FS_KEY, String(lyricsSize));
  }, [lyricsSize]);
  useEffect(() => {
    localStorage.setItem(TS_KEY, String(titleSize));
  }, [titleSize]);

  // Hide hint after 4s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Keyboard — exact same shortcuts as adventisthymns
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Navigation
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

      // Font size — matches adventisthymns Ctrl + / Ctrl - / Ctrl 0
      if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setLyricsSize((s) => Math.min(s + 3, 120));
        setTitleSize((s) => Math.min(s + 1, 100));
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        setLyricsSize((s) => Math.max(s - 3, 20));
        setTitleSize((s) => Math.max(s - 1, 18));
      }
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        setLyricsSize(54);
        setTitleSize(56);
      }

      // Jump to verse: press 1-9 (matches adventisthymns)
      if (!e.ctrlKey && !e.altKey && e.key >= "1" && e.key <= "9") {
        const verseNum = parseInt(e.key);
        const idx = slides.findIndex((s) => s.verseNum === verseNum);
        if (idx > -1) setCurrent(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose, slides]);

  // Auto landscape + fullscreen on mobile, fullscreen on desktop
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
    : "'Georgia', 'Crimson Pro', serif";
  const titleFont = isTelugu
    ? "'Noto Sans Telugu', sans-serif"
    : "'Georgia', 'Crimson Pro', serif";
  const progressPct =
    slides.length > 1 ? ((current + 1) / slides.length) * 100 : 100;

  return (
    <div
      className="present-root"
      onClick={next}
      onTouchStart={(e) => {
        touchStart.current = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
        };
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          if (dx < 0) next();
          else prev();
        }
      }}
    >
      {/* ─── TOP BAR ─────────────────────────────────── */}
      <div className="present-topbar" onClick={(e) => e.stopPropagation()}>
        <button
          className="present-btn"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
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

        <div className="present-counter">
          {current + 1} / {slides.length}
        </div>

        <div className="present-font-controls">
          <button
            className="present-btn small"
            onClick={() => {
              setLyricsSize((s) => Math.max(s - 3, 20));
              setTitleSize((s) => Math.max(s - 1, 18));
            }}
            title="Decrease (Ctrl -)"
          >
            A−
          </button>
          <button
            className="present-btn small"
            onClick={() => {
              setLyricsSize(54);
              setTitleSize(56);
            }}
            title="Reset (Ctrl 0)"
            style={{ fontSize: 11 }}
          >
            reset
          </button>
          <button
            className="present-btn small"
            onClick={() => {
              setLyricsSize((s) => Math.min(s + 3, 120));
              setTitleSize((s) => Math.min(s + 1, 100));
            }}
            title="Increase (Ctrl +)"
          >
            A+
          </button>
        </div>
      </div>

      {/* ─── SLIDE CONTENT ─────────────────────────────── */}
      <div className="present-slide">
        {/* Song title — shown on EVERY slide (like adventisthymns) */}
        <h1
          className="present-title"
          style={{ fontFamily: titleFont, fontSize: `${titleSize}px` }}
        >
          {song.title}
        </h1>

        {/* Label: Verse 1 / Refrain */}
        <h2 className="present-label">{slide.label}</h2>

        {/* Lyrics */}
        <p
          className={`present-lyrics ${slide.type === "refrain" ? "refrain" : ""}`}
          style={{
            fontFamily: lyricsFont,
            fontSize: `${lyricsSize}px`,
            lineHeight: isTelugu ? 2 : 1.4,
          }}
        >
          {slide.text.split("\n").map((line, i) => (
            <span key={i}>
              {line || "\u00A0"}
              {i < slide.text.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>

      {/* ─── BOTTOM PROGRESS BAR ──────────────────────── */}
      <div className="present-progress">
        <div
          className="present-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ─── HINT ─────────────────────────────────────── */}
      {showHint && current === 0 && (
        <div className="present-hint">
          tap or swipe · arrow keys · 1–9 jump verse · Ctrl ± font
        </div>
      )}

      <style>{`
        .present-root {
          position: fixed; inset: 0;
          background: #000;
          z-index: 1000;
          display: flex; flex-direction: column;
          user-select: none; cursor: pointer;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .present-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 18px;
          z-index: 5;
          pointer-events: none;
        }
        .present-topbar > * { pointer-events: auto; }

        .present-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          width: 38px; height: 38px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-family: inherit;
          font-weight: 500;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .present-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }
        .present-btn.small {
          width: 36px; height: 36px;
          font-size: 13px;
        }

        .present-counter {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em;
        }

        .present-font-controls {
          display: flex; gap: 6px;
        }

        .present-slide {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 6vw 60px;
          text-align: center;
          width: 100%;
        }

        .present-title {
          color: rgba(255,255,255,0.92);
          font-weight: 400;
          line-height: 1.15;
          margin: 0 0 1.2rem 0;
          letter-spacing: -0.005em;
        }

        .present-label {
          color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(14px, 1.5vw, 18px);
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 0 0 2.2rem 0;
        }

        .present-lyrics {
          color: #FFFFFF;
          font-weight: 400;
          margin: 0;
          max-width: 1400px;
        }
        .present-lyrics.refrain {
          color: #FFE898;
          font-style: italic;
        }

        .present-progress {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: rgba(255,255,255,0.08);
          z-index: 4;
        }
        .present-progress-fill {
          height: 100%;
          background: rgba(255,255,255,0.7);
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .present-hint {
          position: absolute;
          bottom: 20px;
          left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.05em;
          animation: fadeOutHint 4s forwards;
          pointer-events: none;
          white-space: nowrap;
        }

        @keyframes fadeOutHint {
          0%, 60% { opacity: 1; }
          100% { opacity: 0; }
        }

        @media (max-width: 600px) {
          .present-slide { padding: 70px 4vw 50px; }
        }
      `}</style>
    </div>
  );
}
