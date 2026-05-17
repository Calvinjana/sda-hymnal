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
    getSongs("en", 1, 5).then((r) => setPopular(r.data));
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
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
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F1E3A 0%, #243B5E 60%)",
          padding: "5rem 2rem 4rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: "1.5rem" }}>✝</div>
        <h1
          style={{
            fontFamily: "Crimson Pro, serif",
            fontSize: "3.2rem",
            fontWeight: 300,
            color: "#E8D48B",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
          }}
        >
          <strong style={{ fontWeight: 600, display: "block" }}>
            SDA Hymnal
          </strong>
        </h1>
        <p
          style={{
            color: "rgba(232,212,139,0.6)",
            fontSize: 15,
            marginBottom: "2.5rem",
          }}
        >
          Seventh-day Adventist · English & Telugu · 1200+ Songs
        </p>

        {/* Search */}
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, number, or lyrics..."
            style={{
              width: "100%",
              padding: "16px 52px 16px 20px",
              borderRadius: 50,
              border: "2px solid rgba(201,168,76,0.3)",
              background: "rgba(255,255,255,0.05)",
              color: "#E8D48B",
              fontSize: 15,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
            }}
          >
            🔍
          </span>
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <div
            style={{
              maxWidth: 560,
              margin: "12px auto 0",
              background: "var(--cream-mid)",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--parchment)",
              textAlign: "left",
            }}
          >
            {results.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/song/${s.id}`)}
                style={{
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--parchment)",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--gold)",
                    fontWeight: 600,
                    minWidth: 36,
                  }}
                >
                  {s.num}
                </span>
                <span style={{ color: "var(--text-dark)" }}>{s.title}</span>
              </div>
            ))}
          </div>
        )}
        {searching && (
          <p
            style={{
              color: "rgba(232,212,139,0.4)",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            Searching...
          </p>
        )}
      </div>

      <main
        style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 2rem" }}
      >
        {/* Hymnal Cards */}
        <h2
          style={{
            fontFamily: "Crimson Pro, serif",
            fontSize: "1.8rem",
            fontWeight: 400,
            marginBottom: "1.5rem",
          }}
        >
          ♬ Hymnal Collections
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            onClick={() => navigate("/english")}
            style={{
              background: "linear-gradient(145deg, #0F1E3A, #243B5E)",
              borderRadius: 12,
              cursor: "pointer",
              overflow: "hidden",
              transition: "transform 0.2s",
              boxShadow: "0 4px 24px rgba(15,30,58,0.12)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div style={{ padding: "2rem", display: "flex", gap: "1.5rem" }}>
              <div>
                <div
                  style={{
                    fontFamily: "Crimson Pro, serif",
                    fontSize: "2.5rem",
                    fontWeight: 300,
                    color: "#E8D48B",
                  }}
                >
                  600+
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(232,212,139,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Hymns
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#E8D48B",
                    marginBottom: 4,
                  }}
                >
                  📖 English Hymnal
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(232,212,139,0.6)",
                    lineHeight: 1.5,
                  }}
                >
                  Complete SDA English hymnal with full lyrics and presentation
                  mode
                </div>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(232,212,139,0.1)",
                padding: "12px 2rem",
                color: "#C9A84C",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Browse English Hymns →
            </div>
          </div>

          <div
            onClick={() => navigate("/telugu")}
            style={{
              background: "linear-gradient(145deg, #1A3527, #2E5C45)",
              borderRadius: 12,
              cursor: "pointer",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(15,30,58,0.12)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div style={{ padding: "2rem", display: "flex", gap: "1.5rem" }}>
              <div>
                <div
                  style={{
                    fontFamily: "Crimson Pro, serif",
                    fontSize: "2.5rem",
                    fontWeight: 300,
                    color: "#A8E6D4",
                  }}
                >
                  966
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(174,230,212,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  భజనలు
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#A8E6D4",
                    marginBottom: 4,
                  }}
                >
                  📿 Telugu Hymnal
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(174,230,212,0.6)",
                    lineHeight: 1.5,
                    fontFamily: "Noto Sans Telugu, sans-serif",
                  }}
                >
                  తెలుగు SDA భజన పుస్తకం - పూర్తి సాహిత్యంతో
                </div>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(174,230,212,0.1)",
                padding: "12px 2rem",
                color: "#4AA897",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Browse Telugu Hymns →
            </div>
          </div>
        </div>

        {/* Popular Songs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "1.8rem",
              fontWeight: 400,
            }}
          >
            ⭐ Popular Hymns
          </h2>
          <button
            onClick={() => navigate("/english")}
            style={{
              color: "var(--gold)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            View all →
          </button>
        </div>
        <SongList songs={popular} onSelect={(id) => navigate(`/song/${id}`)} />
      </main>
    </div>
  );
}

function SongList({
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
          color: "var(--text-soft)",
        }}
      >
        Loading hymns...
      </div>
    );
  return (
    <div
      style={{
        background: "var(--cream-mid)",
        border: "1px solid var(--parchment)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {songs.map((s) => (
        <div
          key={s.id}
          onClick={() => onSelect(s.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 20px",
            borderBottom: "1px solid var(--parchment)",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--parchment)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: 40,
              color: "var(--gold)",
              fontWeight: 600,
              fontSize: 15,
              fontFamily: "Crimson Pro, serif",
            }}
          >
            {s.num}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{s.title}</div>
            <div
              style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}
            >
              English
            </div>
          </div>
          <div style={{ color: "var(--gold)", opacity: 0.5 }}>›</div>
        </div>
      ))}
    </div>
  );
}
