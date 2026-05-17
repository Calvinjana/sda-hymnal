import { useState, useEffect, useCallback } from "react";
import type { Song, Stanza } from "../types/song.types";

interface Slide {
  type: "title" | "stanza" | "chorus";
  label: string;
  text: string;
}

function buildSlides(song: Song): Slide[] {
  const slides: Slide[] = [];
  slides.push({ type: "title", label: song.num, text: song.title });

  const chorus = song.stanzas.find((s) => s.is_chorus);
  const nonChorus = song.stanzas.filter((s) => !s.is_chorus);

  if (song.has_chorus && chorus) {
    nonChorus.forEach((st) => {
      slides.push({ type: "stanza", label: st.label, text: st.text });
      slides.push({
        type: "chorus",
        label: "పల్లవి / Chorus",
        text: chorus.text,
      });
    });
  } else {
    song.stanzas.forEach((st) => {
      slides.push({
        type: st.is_chorus ? "chorus" : "stanza",
        label: st.label,
        text: st.text,
      });
    });
  }

  return slides;
}

export default function PresentationMode({
  song,
  onClose,
}: {
  song: Song;
  onClose: () => void;
}) {
  const slides = buildSlides(song);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [hint, setHint] = useState(true);

  const next = useCallback(
    () => setCurrent((c) => Math.min(slides.length - 1, c + 1)),
    [slides.length],
  );
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ")
        next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose]);

  // Auto landscape on mobile
  useEffect(() => {
    const lockLandscape = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch {
        // Browser doesn't support — silently ignore
      }
    };
    lockLandscape();

    // Also request fullscreen
    try {
      document.documentElement.requestFullscreen?.();
    } catch {}

    return () => {
      try {
        screen.orientation?.unlock();
        if (document.fullscreenElement) document.exitFullscreen?.();
      } catch {}
    };
  }, []);

  const slide = slides[current];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050D1F",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        cursor: "pointer",
      }}
      onClick={next}
      onTouchStart={(e) => {
        setTouchStart(e.changedTouches[0].clientX);
        setTouchStartY(e.changedTouches[0].clientY);
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStart;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Only swipe if horizontal movement is dominant
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          if (dx < 0) next();
          if (dx > 0) prev();
        }
      }}
    >
      {/* Cross watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          fontSize: "40vw",
          opacity: 0.03,
          color: "#fff",
          pointerEvents: "none",
          lineHeight: 1,
        }}
      >
        ✝
      </div>

      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          zIndex: 2,
        }}
      >
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? "#C9A84C" : "rgba(255,255,255,0.2)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          color: "rgba(201,168,76,0.4)",
          fontSize: 13,
          zIndex: 2,
        }}
      >
        {current + 1} / {slides.length}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: "absolute",
          top: 16,
          left: 20,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.6)",
          width: 40,
          height: 40,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: 18,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>

      {/* Slide content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "85vw",
          padding: "2rem",
          animation: "fadeSlide 0.3s ease",
        }}
      >
        {slide.type === "title" ? (
          <>
            <div
              style={{
                fontFamily: "Crimson Pro, serif",
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "rgba(201,168,76,0.4)",
                marginBottom: "1rem",
              }}
            >
              Hymn {slide.label}
            </div>
            <div
              style={{
                fontFamily:
                  song.lang === "te"
                    ? "Noto Sans Telugu, serif"
                    : "Crimson Pro, serif",
                fontSize: "clamp(2rem, 5vw, 4rem)",
                color: "#F5EDD0",
                fontWeight: 300,
                lineHeight: 1.3,
              }}
            >
              {slide.text}
            </div>
            <div
              style={{
                marginTop: "2rem",
                color: "rgba(255,255,255,0.2)",
                fontSize: 13,
                letterSpacing: "0.1em",
              }}
            >
              TAP · SWIPE · ARROW KEYS
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "clamp(11px, 1.5vw, 14px)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                color:
                  slide.type === "chorus"
                    ? "rgba(201,168,76,0.7)"
                    : "rgba(255,255,255,0.3)",
              }}
            >
              {slide.label}
            </div>
            <div
              style={{
                fontFamily:
                  song.lang === "te"
                    ? "Noto Sans Telugu, sans-serif"
                    : "Crimson Pro, serif",
                fontSize: "clamp(1.4rem, 3.5vw, 2.8rem)",
                lineHeight: song.lang === "te" ? 2 : 1.75,
                fontWeight: 300,
                color: slide.type === "chorus" ? "#FFE898" : "#E8DFC8",
              }}
            >
              {slide.text.split("\n").map((line, i) => (
                <div key={i}>{line || "\u00A0"}</div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Swipe hint — fades away */}
      {hint && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            color: "rgba(255,255,255,0.25)",
            fontSize: 13,
            letterSpacing: "0.08em",
            animation: "fadeOut 3s forwards",
            pointerEvents: "none",
          }}
        >
          ← swipe or tap to advance →
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1 }
          70% { opacity: 1 }
          100% { opacity: 0 }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  );
}
