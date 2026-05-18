import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSongs } from "../services/songs.service";
import type { SongSummary } from "../types/song.types";
import { SongList } from "./HomePage";

const PER_PAGE = 25;

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
  const start = (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, total);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(145deg, var(--hero-from), var(--hero-to))",
          padding: "2.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(191,219,254,0.5)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            SDA Hymnal
          </div>
          <h1
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "2.2rem",
              fontWeight: 300,
              color: "#FFFFFF",
              marginBottom: "1.25rem",
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
            placeholder="Search by title or number..."
            style={{
              width: "100%",
              maxWidth: 440,
              padding: "11px 18px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid rgba(96,165,250,0.25)",
              background: "rgba(255,255,255,0.07)",
              color: "#FFFFFF",
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(96,165,250,0.6)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(96,165,250,0.25)")
            }
          />
        </div>
      </div>

      <main
        style={{ maxWidth: 1100, margin: "0 auto", padding: "1.75rem 1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {loading
              ? "Loading..."
              : `Showing ${start}–${end} of ${total} hymns`}
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <SongList songs={songs} onSelect={(id) => navigate(`/song/${id}`)} />
        )}

        {totalPages > 1 && !loading && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "13px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 14,
              background: "var(--bg-hover)",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 14,
              background: "var(--bg-hover)",
              borderRadius: 4,
              maxWidth: 300,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        marginTop: "1.5rem",
        flexWrap: "wrap",
      }}
    >
      <PBtn
        label="‹"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
      />
      {pages.map((p, i, arr) => (
        <span key={p} style={{ display: "contents" }}>
          {i > 0 && arr[i - 1] !== p - 1 && (
            <span
              style={{
                color: "var(--text-faint)",
                lineHeight: "36px",
                padding: "0 2px",
              }}
            >
              …
            </span>
          )}
          <PBtn
            label={String(p)}
            onClick={() => onChange(p)}
            active={p === page}
          />
        </span>
      ))}
      <PBtn
        label="›"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      />
    </div>
  );
}

function PBtn({ label, onClick, active, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-sm)",
        border: "1.5px solid var(--border-mid)",
        background: active ? "var(--accent)" : "var(--bg-card)",
        color: active ? "#FFFFFF" : "var(--text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: active ? 600 : 400,
        fontFamily: "inherit",
        fontSize: 14,
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
