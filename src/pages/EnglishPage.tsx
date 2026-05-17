import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSongs } from "../services/songs.service";
import type { SongSummary } from "../types/song.types";

const PER_PAGE = 20;

export default function EnglishPage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSongs("en", page, PER_PAGE, search).then((r) => {
      setSongs(r.data);
      setTotal(r.count);
      setLoading(false);
    });
  }, [page, search]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div style={{ background: "var(--navy)", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 12,
              color: "rgba(232,212,139,0.4)",
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
              color: "#E8D48B",
              marginBottom: "1.5rem",
            }}
          >
            📖 English Hymnal
          </h1>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title or number..."
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1.5px solid rgba(201,168,76,0.3)",
              background: "rgba(255,255,255,0.05)",
              color: "#E8D48B",
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
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
            ? "Loading..."
            : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total} hymns`}
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
                }}
              >
                {s.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{s.title}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-soft)",
                    marginTop: 2,
                  }}
                >
                  English {s.has_chorus && "· Has chorus"}
                </div>
              </div>
              <div style={{ color: "var(--gold)", opacity: 0.5 }}>›</div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: "1.5rem",
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
                <>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span
                      key={`dots-${p}`}
                      style={{ padding: "0 4px", color: "var(--text-soft)" }}
                    >
                      …
                    </span>
                  )}
                  <PageBtn
                    key={p}
                    label={String(p)}
                    onClick={() => setPage(p)}
                    active={p === page}
                  />
                </>
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
