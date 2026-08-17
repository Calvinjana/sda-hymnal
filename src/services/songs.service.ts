import { supabase } from "./supabase";
import type { Song, SongSummary } from "../types/song.types";
import {
  transliterateStanza,
  transliterateLine,
} from "../utils/transliterate-telugu";

// ── English-keyboard search for Telugu songs ─────────────────────────────
// Telugu titles are transliterated once and cached, so users typing on an
// English keyboard (e.g. "devudu") can still find "దేవుడు". Cache lives
// for the page session — a hard refresh picks up any newly imported songs.
const LATIN_ONLY = /^[a-zA-Z0-9\s]+$/;

interface TeluguIndexEntry extends SongSummary {
  translit: string; // normalized: lowercase, letters/digits only
}

let teluguIndexCache: TeluguIndexEntry[] | null = null;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function getTeluguIndex(): Promise<TeluguIndexEntry[]> {
  if (teluguIndexCache) return teluguIndexCache;
  const { data, error } = await supabase
    .from("songs")
    .select("id, num, title, lang, has_chorus, category_id")
    .eq("lang", "te")
    .order("num");
  if (error) throw error;
  teluguIndexCache = (data ?? []).map((s) => ({
    ...s,
    translit: normalize(transliterateLine(s.title)),
  }));
  return teluguIndexCache;
}

export async function getSongs(
  lang: "en" | "te",
  page = 1,
  perPage = 20,
  search = "",
): Promise<{ data: SongSummary[]; count: number }> {
  const trimmed = search.trim();

  // Telugu + Latin-letter query → match against transliterated titles
  // instead of the Telugu-script column (ilike against Telugu text would
  // never match English input).
  if (lang === "te" && trimmed && LATIN_ONLY.test(trimmed)) {
    const index = await getTeluguIndex();
    const q = normalize(trimmed);
    const qNum = trimmed.replace(/^0+/, "");
    const matches = index.filter(
      (s) => s.translit.includes(q) || s.num.replace(/^0+/, "") === qNum,
    );
    const from = (page - 1) * perPage;
    return {
      data: matches.slice(from, from + perPage),
      count: matches.length,
    };
  }

  // Normal path: Telugu-script search, or English-language songs.
  let query = supabase
    .from("songs")
    .select("id, num, title, lang, has_chorus, category_id", { count: "exact" })
    .eq("lang", lang)
    .order("num");
  if (trimmed) {
    query = query.or(`title.ilike.%${trimmed}%,num.eq.${trimmed}`);
  }
  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getSongById(id: string): Promise<Song> {
  const { data, error } = await supabase
    .from("songs")
    .select("*, stanzas(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  // Sort stanzas by order_index
  data.stanzas.sort((a: any, b: any) => a.order_index - b.order_index);
  // Auto-generate transliteration for Telugu songs
  if (data.lang === "te") {
    data.stanzas = data.stanzas.map((st: any) => ({
      ...st,
      translit: transliterateStanza(st.text),
    }));
  }
  return data;
}

export async function searchSongs(query: string): Promise<SongSummary[]> {
  const trimmed = query.trim();

  const { data, error } = await supabase
    .from("songs")
    .select("id, num, title, lang, has_chorus, category_id")
    .or(`title.ilike.%${trimmed}%,num.ilike.%${trimmed}%`)
    .limit(8);
  if (error) throw error;

  let results: SongSummary[] = data ?? [];

  // Also check transliterated Telugu titles when the query looks like
  // plain English-keyboard input, merging in any extra matches.
  if (trimmed && LATIN_ONLY.test(trimmed)) {
    const index = await getTeluguIndex();
    const q = normalize(trimmed);
    const existingIds = new Set(results.map((r) => r.id));
    for (const entry of index) {
      if (results.length >= 8) break;
      if (existingIds.has(entry.id)) continue;
      if (entry.translit.includes(q)) {
        const { translit, ...summary } = entry;
        results.push(summary);
        existingIds.add(entry.id);
      }
    }
  }

  return results.slice(0, 8);
}
