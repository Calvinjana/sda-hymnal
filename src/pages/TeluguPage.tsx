import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSongs } from "../services/songs.service";
import type { SongSummary } from "../types/song.types";

const PER_PAGE = 20;

export default function TeluguPage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSongs("te", page, PER_PAGE, search).then((r) => {
      setSongs(r.data);
      setTotal(r.count);
      setLoading(false);
    });
  }, [page, search]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F2A20 0%, #1A3D2E 100%)",
          padding: "2.5rem 2rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 12,
              color: "rgba(174,230,212,0.4)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            SDA Hymnal
          </p>
          <h1
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "2.5rem",
              fontWeight: 300,
              color: "#A8E6D4",
              marginBottom: 4,
            }}
          >
            📿 Telugu Hymnal
          </h1>
          <p
            style={{
              fontFamily: "Noto Sans Telugu, sans-serif",
              color: "rgba(174,230,212,0.6)",
              fontSize: "1.1rem",
              marginBottom: "1.5rem",
            }}
          >
            తెలుగు SDA భజన పుస్తకం
          </p>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="శోధించండి - పేరు లేదా సంఖ్య..."
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1.5px solid rgba(174,230,212,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "#A8E6D4",
              fontSize: 14,
              outline: "none",
              fontFamily: "Noto Sans Telugu, sans-serif",
            }}
          />
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-soft)",
            marginBottom: "1rem",
          }}
        >
          {loading
            ? "లోడ్ అవుతోంది..."
            : `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} చూపిస్తున్నాము, మొత్తం ${total} భజనలు`}
        </p>

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
              onClick={() => navigate(`/song/${s.id}`)}
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
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: "Noto Sans Telugu, sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-soft)",
                    marginTop: 2,
                  }}
                >
                  తెలుగు {s.has_chorus && "· పల్లవి ఉంది"}
                </div>
              </div>
              <div
                style={{ color: "var(--gold)", opacity: 0.5, flexShrink: 0 }}
              >
                ›
              </div>
            </div>
          ))}
          {!loading && songs.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-soft)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
              <p style={{ fontFamily: "Noto Sans Telugu, sans-serif" }}>
                భజనలు కనుగొనబడలేదు
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <PageBtn
              label="‹"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, i, arr) => (
                <span key={p} style={{ display: "contents" }}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span
                      style={{
                        padding: "0 4px",
                        color: "var(--text-soft)",
                        lineHeight: "36px",
                      }}
                    >
                      …
                    </span>
                  )}
                  <PageBtn
                    label={String(p)}
                    onClick={() => setPage(p)}
                    active={p === page}
                  />
                </span>
              ))}
            <PageBtn
              label="›"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function PageBtn({
  label,
  onClick,
  active,
  disabled,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: "1.5px solid var(--parchment)",
        background: active ? "var(--gold)" : "var(--cream-mid)",
        color: active ? "var(--navy)" : "var(--text-mid)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 600 : 400,
        fontFamily: "inherit",
        fontSize: 14,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}
