import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSongs } from "../services/songs.service";
import type { SongSummary } from "../types/song.types";
import { SongList } from "./HomePage";
import { Pagination } from "./EnglishPage";

const PER_PAGE = 25;

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
  const start = (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, total);

  return (
    <div>
      <div
        style={{
          background:
            "linear-gradient(145deg, var(--card-te-from), var(--card-te-to))",
          padding: "2.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(110,231,183,0.5)",
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
              marginBottom: 4,
            }}
          >
            📿 Telugu Hymnal
          </h1>
          <p
            style={{
              fontFamily: "Noto Sans Telugu, sans-serif",
              color: "rgba(110,231,183,0.6)",
              fontSize: "1.05rem",
              marginBottom: "1.25rem",
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
            placeholder="శోధించండి — పేరు లేదా సంఖ్య..."
            style={{
              width: "100%",
              maxWidth: 440,
              padding: "11px 18px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid rgba(110,231,183,0.2)",
              background: "rgba(255,255,255,0.07)",
              color: "#FFFFFF",
              fontSize: 14,
              outline: "none",
              fontFamily: "Noto Sans Telugu, sans-serif",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(110,231,183,0.5)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(110,231,183,0.2)")
            }
          />
        </div>
      </div>

      <main
        style={{ maxWidth: 1100, margin: "0 auto", padding: "1.75rem 1.5rem" }}
      >
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: "1rem",
          }}
        >
          {loading
            ? "లోడ్ అవుతోంది..."
            : `${start}–${end} చూపిస్తున్నాము, మొత్తం ${total} భజనలు`}
        </p>
        <SongList songs={songs} onSelect={(id) => navigate(`/song/${id}`)} />
        {totalPages > 1 && !loading && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </main>
    </div>
  );
}
