import { useState, useEffect, useCallback } from "react";
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
          padding: "4rem",
          color: "var(--text-soft)",
        }}
      >
        Loading hymn...
      </div>
    );
  if (!song)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          color: "var(--text-soft)",
        }}
      >
        Hymn not found
      </div>
    );

  // Build display stanzas: insert chorus after every non-chorus stanza
  const chorus = song.stanzas.find((s) => s.is_chorus);
  const displayStanzas = buildDisplayStanzas(song.stanzas, song.has_chorus);

  return (
    <div>
      {presenting && (
        <PresentationMode song={song} onClose={() => setPresenting(false)} />
      )}

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-soft)",
            cursor: "pointer",
            marginBottom: "1.5rem",
            fontSize: 14,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div
          style={{
            background: "var(--navy)",
            borderRadius: 12,
            padding: "2.5rem",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "4rem",
              fontWeight: 300,
              color: "rgba(232,212,139,0.2)",
              lineHeight: 1,
            }}
          >
            {song.num}
          </div>
          <div
            style={{
              fontFamily: "Crimson Pro, serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#E8D48B",
              marginBottom: "1rem",
            }}
          >
            {song.title}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                background: "rgba(201,168,76,0.2)",
                color: "#E8D48B",
                padding: "4px 12px",
                borderRadius: 50,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              English
            </span>
            {song.has_chorus && (
              <span
                style={{
                  background: "rgba(46,125,110,0.3)",
                  color: "#7DD9C8",
                  padding: "4px 12px",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Has Chorus
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setPresenting(true)}
            style={{
              background: "var(--gold)",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              color: "var(--navy)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🖥 Present Song
          </button>
        </div>

        {/* Lyrics */}
        <div
          style={{
            background: "var(--cream-mid)",
            border: "1px solid var(--parchment)",
            borderRadius: 12,
            padding: "2.5rem",
          }}
        >
          {displayStanzas.map((st, i) => (
            <StanzaBlock key={i} stanza={st} />
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <p
            style={{
              fontFamily: "Crimson Pro, serif",
              fontStyle: "italic",
              color: "var(--text-soft)",
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

// Builds display order: Stanza 1, Chorus, Stanza 2, Chorus, Stanza 3, Chorus...
function buildDisplayStanzas(stanzas: Stanza[], hasChorus: boolean): Stanza[] {
  if (!hasChorus) return stanzas;

  const chorus = stanzas.find((s) => s.is_chorus);
  if (!chorus) return stanzas;

  const result: Stanza[] = [];
  const nonChorus = stanzas.filter((s) => !s.is_chorus);

  nonChorus.forEach((st) => {
    result.push(st);
    result.push(chorus); // repeat chorus after every stanza
  });

  return result;
}

function StanzaBlock({ stanza }: { stanza: Stanza }) {
  if (stanza.is_chorus) {
    return (
      <div
        style={{
          background: "var(--parchment)",
          borderLeft: "3px solid var(--gold)",
          borderRadius: "0 8px 8px 0",
          padding: "1.25rem 1.5rem",
          margin: "1.5rem 0",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--gold)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: "0.75rem",
          }}
        >
          Chorus
        </div>
        <div
          style={{
            fontFamily: "Crimson Pro, serif",
            fontSize: "1.2rem",
            lineHeight: 1.9,
            fontWeight: 300,
          }}
        >
          {stanza.text.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--gold)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: "0.75rem",
        }}
      >
        {stanza.label}
      </div>
      <div
        style={{
          fontFamily: "Crimson Pro, serif",
          fontSize: "1.25rem",
          lineHeight: 1.9,
          fontWeight: 300,
        }}
      >
        {stanza.text.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
