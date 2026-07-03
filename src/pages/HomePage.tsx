import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchSongs, getSongs } from "../services/songs.service";
import type { SongSummary } from "../types/song.types";

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongSummary[]>([]);
  const [popular, setPopular] = useState<SongSummary[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getSongs("en", 1, 6).then((r) => setPopular(r.data));
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchSongs(query);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(145deg, var(--hero-from) 0%, var(--hero-to) 100%)",
          padding: "5rem 2rem 4rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(96,165,250,0.06)",
            top: -100,
            left: -100,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(96,165,250,0.05)",
            bottom: -80,
            right: -60,
            pointerEvents: "none",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src="/sda-symbol.svg"
            alt="SDA Symbol"
            style={{
              width: 130,
              height: 130,
              filter: `brightness(0) invert(1)
        drop-shadow(0 0 8px rgba(255,255,255,0.7))`,
              display: "inline-block",
            }}
          />
        </div>

        <div
          style={{
            display: "inline-block",
            background: "rgba(96,165,250,0.12)",
            border: "1px solid rgba(96,165,250,0.25)",
            color: "var(--blue-300)",
            padding: "4px 16px",
            borderRadius: 50,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Seventh-day Adventist
        </div>

        <h1
          style={{
            fontFamily: "Crimson Pro, serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 300,
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          SDA <strong style={{ fontWeight: 600 }}>Hymnal</strong>
        </h1>

        <p
          style={{
            color: "rgba(191,219,254,0.7)",
            fontSize: 15,
            marginBottom: "2.5rem",
            letterSpacing: "0.02em",
          }}
        >
          English & Telugu · 1200+ Songs · Worship & Praise
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(191,219,254,0.5)",
              fontSize: 18,
              pointerEvents: "none",
            }}
          >
            🔍
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, number, or lyrics..."
            style={{
              width: "100%",
              padding: "16px 20px 16px 50px",
              borderRadius: "var(--radius-pill)",
              border: "1.5px solid rgba(96,165,250,0.25)",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
              color: "#FFFFFF",
              fontSize: 15,
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(96,165,250,0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(96,165,250,0.25)";
              e.target.style.boxShadow = "none";
            }}
          />
          {searching && (
            <div
              style={{
                position: "absolute",
                right: 18,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(191,219,254,0.5)",
                fontSize: 13,
              }}
            >
              ...
            </div>
          )}
        </div>

        {/* Search results dropdown */}
        {results.length > 0 && (
          <div
            style={{
              maxWidth: 560,
              margin: "8px auto 0",
              background: "var(--bg-card)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              textAlign: "left",
            }}
          >
            {results.map((s, i) => (
              <div
                key={s.id}
                onClick={() => {
                  navigate(`/song/${s.id}`);
                  setQuery("");
                  setResults([]);
                }}
                style={{
                  padding: "11px 18px",
                  cursor: "pointer",
                  borderBottom:
                    i < results.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  style={{
                    color: "var(--num-color)",
                    fontWeight: 600,
                    fontSize: 14,
                    minWidth: 36,
                    fontFamily: "Crimson Pro, serif",
                  }}
                >
                  {s.num}
                </span>
                <span style={{ color: "var(--text-primary)", fontSize: 14 }}>
                  {s.title}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "var(--text-faint)",
                    background: "var(--accent-light)",
                    padding: "2px 8px",
                    borderRadius: 50,
                  }}
                >
                  {s.lang === "te" ? "తె" : "EN"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick filter tags */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          {["Praise", "Worship", "Prayer", "Advent", "Easter"].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/english?category=${tag}`)}
              style={{
                background: "rgba(96,165,250,0.1)",
                border: "1px solid rgba(96,165,250,0.2)",
                color: "rgba(191,219,254,0.8)",
                padding: "5px 14px",
                borderRadius: 50,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(96,165,250,0.2)";
                e.currentTarget.style.color = "#BFDBFE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(96,165,250,0.1)";
                e.currentTarget.style.color = "rgba(191,219,254,0.8)";
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────── */}
      <main
        style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}
      >
        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            { num: "693", label: "English Hymns", icon: "📖" },
            { num: "620", label: "Telugu Hymns", icon: "📿" },
            { num: "1313", label: "Total Songs", icon: "🎵" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1.25rem",
                textAlign: "center",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: "Crimson Pro, serif",
                  fontSize: "1.8rem",
                  fontWeight: 400,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Hymnal cards */}
        <SectionHeader title="♬ Hymnal Collections" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <HymnalCard
            gradient={`linear-gradient(145deg, var(--card-en-from), var(--card-en-to))`}
            count="693"
            countLabel="Hymns"
            icon="📖"
            title="English Hymnal"
            desc="Complete SDA English hymnal with full lyrics, chorus, and presentation mode"
            cta="Browse English Hymns →"
            ctaColor="var(--blue-300)"
            onClick={() => navigate("/english")}
          />
          <HymnalCard
            gradient={`linear-gradient(145deg, var(--card-te-from), var(--card-te-to))`}
            count="966"
            countLabel="భజనలు"
            icon="📿"
            title="Telugu Hymnal"
            desc="తెలుగు SDA భజన పుస్తకం - పూర్తి సాహిత్యంతో"
            cta="Browse Telugu Hymns →"
            ctaColor="#6EE7B7"
            onClick={() => navigate("/telugu")}
            descTelugu
          />
        </div>

        {/* Popular songs */}
        <SectionHeader
          title="⭐ Popular Hymns"
          action="View all →"
          onAction={() => navigate("/english")}
        />
        <SongList songs={popular} onSelect={(id) => navigate(`/song/${id}`)} />
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "var(--nav-bg)",
          color: "var(--nav-text-muted)",
          textAlign: "center",
          padding: "2.5rem 2rem",
          marginTop: "3rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
          <img
            src="/sda-symbol.svg"
            alt="SDA Symbol"
            style={{
              width: 80,
              height: 80,
              filter: `brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.7))`,
              display: "inline-block",
              opacity: 0.5,
            }}
          />
        </div>
        <p
          style={{ color: "var(--nav-text)", fontWeight: 500, marginBottom: 4 }}
        >
          SDA Hymnal
        </p>
        <p style={{ fontSize: 13 }}>
          Seventh-day Adventist · English & Telugu · Worship & Praise
        </p>
        <p style={{ fontSize: 11, marginTop: "0.75rem", opacity: 0.4 }}>
          Built with love for the congregation
        </p>
      </footer>
    </div>
  );
}

/* ── REUSABLE COMPONENTS ──────────────────────────── */

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "1rem",
      }}
    >
      <h2
        style={{
          fontFamily: "Crimson Pro, serif",
          fontSize: "1.6rem",
          fontWeight: 400,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      {action && (
        <button
          onClick={onAction}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function HymnalCard({
  gradient,
  count,
  countLabel,
  icon,
  title,
  desc,
  cta,
  ctaColor,
  onClick,
  descTelugu,
}: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: gradient,
        borderRadius: "var(--radius)",
        cursor: "pointer",
        overflow: "hidden",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow)",
        transition: "transform 0.25s, box-shadow 0.25s",
      }}
    >
      <div
        style={{
          padding: "1.75rem",
          display: "flex",
          gap: "1.25rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "2.2rem",
              fontWeight: 300,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1,
            }}
          >
            {count}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 2,
            }}
          >
            {countLabel}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              marginBottom: 6,
            }}
          >
            {icon} {title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
              fontFamily: descTelugu
                ? "Noto Sans Telugu, sans-serif"
                : "inherit",
            }}
          >
            {desc}
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "11px 1.75rem",
          color: ctaColor,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {cta}
      </div>
    </div>
  );
}

export function SongList({
  songs,
  onSelect,
}: {
  songs: SongSummary[];
  onSelect: (id: string) => void;
}) {
  if (!songs.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--text-muted)",
          background: "var(--bg-card)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }}
        >
          🎵
        </div>
        <p>Loading hymns...</p>
      </div>
    );
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {songs.map((s, i) => (
        <div
          key={s.id}
          onClick={() => onSelect(s.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "13px 18px",
            borderBottom:
              i < songs.length - 1 ? "1px solid var(--border)" : "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: 38,
              color: "var(--num-color)",
              fontWeight: 600,
              fontFamily: "Crimson Pro, serif",
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {s.num}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily:
                  s.lang === "te" ? "Noto Sans Telugu, sans-serif" : "inherit",
              }}
            >
              {s.title}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}
            >
              {s.lang === "te" ? "తెలుగు" : "English"}{" "}
              {s.has_chorus && "· Refrain"}
            </div>
          </div>
          <div
            style={{
              color: "var(--accent)",
              opacity: 0.5,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ›
          </div>
        </div>
      ))}
    </div>
  );
}
