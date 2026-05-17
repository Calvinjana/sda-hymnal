import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://vjtxcpsahjrtlvlvmpnr.supabase.co"; // ← paste yours
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdHhjcHNhaGpydGx2bHZtcG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2MTAzNiwiZXhwIjoyMDk0MzM3MDM2fQ.-i3ULEPoQyORSvJIct4UBAZJkI02eaJfAuJtsp77Wx0"; // ← paste yours (service_role, NOT anon)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ← change this line to switch between English and Telugu
const songs = JSON.parse(
  readFileSync("./data/telugu-hymns-clean.json", "utf8"),
);

async function importSongs() {
  console.log(`Starting import of ${songs.length} Telugu songs...\n`);
  let success = 0,
    failed = 0;

  for (const song of songs) {
    const hasChorus = song.has_chorus ?? song.stanzas.some((s) => s.is_chorus);

    const { data: inserted, error: songErr } = await supabase
      .from("songs")
      .insert({
        num: song.num,
        title: song.title,
        lang: song.lang, // 'te'
        has_chorus: hasChorus,
      })
      .select()
      .single();

    if (songErr) {
      console.error(
        `✗ ${song.num} - ${song.title.substring(0, 30)}:`,
        songErr.message,
      );
      failed++;
      continue;
    }

    const stanzas = song.stanzas.map((st, i) => ({
      song_id: inserted.id,
      label: st.label,
      text: st.text,
      is_chorus: st.is_chorus ?? false,
      order_index: i,
    }));

    const { error: stanzaErr } = await supabase.from("stanzas").insert(stanzas);

    if (stanzaErr) {
      console.error(`✗ Stanzas for ${song.num}:`, stanzaErr.message);
      failed++;
      continue;
    }

    success++;
    if (success % 50 === 0) console.log(`✓ ${success} songs imported...`);
  }

  console.log(`\n✅ Done! ${success} succeeded, ${failed} failed`);
}

importSongs();
