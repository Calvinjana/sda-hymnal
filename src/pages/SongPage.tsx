import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSongById } from "../services/songs.service";
import type { Song, Stanza } from "../types/song.types";
import PresentationMode from "../components/PresentationMode";

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [presenting, setPresenting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSongById(id).then((s) => {
      setSong(s);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "5rem 2rem",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: "1rem", opacity: 0.4 }}>
          🎵
        </div>
        <p>Loading hymn...</p>
      </div>
    );
  if (!song)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "5rem 2rem",
          color: "var(--text-muted)",
        }}
      >
        <p>Hymn not found.</p>
      </div>
    );

  const isTelugu = song.lang === "te";
  const displayStanzas = buildDisplayStanzas(song.stanzas, song.has_chorus);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {presenting && (
        <PresentationMode song={song} onClose={() => setPresenting(false)} />
      )}

      {/* Header band */}
      <div
        style={{
          background:
            "linear-gradient(145deg, var(--hero-from), var(--hero-to))",
          padding: "2.5rem 2rem 3rem",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: "1.5rem",
            }}
          >
            ← Back
          </button>

          <div
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "5rem",
              fontWeight: 300,
              color: "rgba(255,255,255,0.1)",
              lineHeight: 1,
              marginBottom: "0.25rem",
              userSelect: "none",
            }}
          >
            {song.num}
          </div>

          <h1
            style={{
              fontFamily: isTelugu
                ? "Noto Sans Telugu, sans-serif"
                : "Crimson Pro, serif",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 400,
              color: "#FFFFFF",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            {song.title}
          </h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge
              text={isTelugu ? "తెలుగు" : "English"}
              color="rgba(96,165,250,0.3)"
              textColor="var(--blue-200)"
            />
            {song.has_chorus && (
              <Badge
                text="Has Refrain"
                color="rgba(201,168,76,0.2)"
                textColor="var(--gold-light)"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setPresenting(true)}
            style={{
              background: "var(--btn-primary-bg)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "var(--btn-primary-text)",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            }}
          >
            <span>⛶</span> Present Song
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--btn-outline-border)",
              borderRadius: "var(--radius-sm)",
              color: copied ? "var(--accent)" : "var(--btn-outline-text)",
              padding: "10px 20px",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {copied ? "✓ Copied!" : "🔗 Copy Link"}
          </button>
        </div>
      </div>

      {/* Lyrics */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "2.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {displayStanzas.map((st, i) => (
            <StanzaBlock key={i} stanza={st} isTelugu={isTelugu} />
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "1.5rem 0",
            borderTop: "1px solid var(--border)",
            marginTop: "1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "Crimson Pro, serif",
              fontStyle: "italic",
              color: "var(--text-muted)",
              fontSize: 15,
            }}
          >
            "Sing to the Lord a new song; sing to the Lord, all the earth." —
            Psalm 96:1
          </p>
        </div>
      </main>
    </div>
  );
}

function buildDisplayStanzas(stanzas: Stanza[], hasChorus: boolean): Stanza[] {
  if (!hasChorus) return stanzas;
  if (!stanzas.some((s) => s.is_chorus)) return stanzas;
  const result: Stanza[] = [];
  stanzas
    .filter((s) => !s.is_chorus)
    .forEach((st) => {
      result.push(st);
      result.push(stanzas.find((s) => s.is_chorus)!);
    });
  return result;
}

function Badge({
  text,
  color,
  textColor,
}: {
  text: string;
  color: string;
  textColor: string;
}) {
  return (
    <span
      style={{
        background: color,
        color: textColor,
        padding: "4px 12px",
        borderRadius: 50,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </span>
  );
}

function StanzaBlock({
  stanza,
  isTelugu,
}: {
  stanza: Stanza;
  isTelugu: boolean;
}) {
  const teluguFont = "Noto Sans Telugu, sans-serif";
  const serifFont = "Crimson Pro, serif";

  const blockStyle = stanza.is_chorus
    ? {
        background: "var(--chorus-bg)",
        borderLeft: "3px solid var(--chorus-border)",
        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
        padding: "1.25rem 1.5rem",
        margin: "1.5rem 0",
      }
    : { marginBottom: "2rem" };

  return (
    <div style={blockStyle}>
      {/* Label */}
      <div
        style={{
          fontSize: 11,
          color: stanza.is_chorus ? "var(--accent)" : "var(--text-faint)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: "0.75rem",
        }}
      >
        {stanza.is_chorus ? "Refrain" : stanza.label}
      </div>

      {isTelugu ? (
        <>
          {/* Full Telugu stanza */}
          <div
            style={{
              fontFamily: teluguFont,
              fontSize: "1.15rem",
              lineHeight: 1.8,
              color: "var(--text-primary)",
              fontWeight: 400,
              whiteSpace: "pre-line",
              marginBottom: "0.75rem",
            }}
          >
            {stanza.text}
          </div>

          {/* Full transliteration stanza */}
          {stanza.translit && (
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "var(--text-muted)",
                fontStyle: "italic",
                whiteSpace: "pre-line",
                paddingLeft: 12,
                borderLeft: "2px solid var(--border)",
              }}
            >
              {stanza.translit}
            </div>
          )}
        </>
      ) : (
        /* English — line by line as before */
        stanza.text.split("\n").map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: serifFont,
              fontSize: "1.25rem",
              lineHeight: 1.9,
              color: "var(--text-primary)",
              fontStyle: stanza.is_chorus ? "italic" : "normal",
            }}
          >
            {line || "\u00A0"}
          </div>
        ))
      )}
    </div>
  );
}
