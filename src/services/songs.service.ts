import { supabase } from "./supabase";
import type { Song, SongSummary } from "../types/song.types";
import { transliterateStanza } from "../utils/transliterate-telugu";

export async function getSongs(
  lang: "en" | "te",
  page = 1,
  perPage = 20,
  search = "",
): Promise<{ data: SongSummary[]; count: number }> {
  let query = supabase
    .from("songs")
    .select("id, num, title, lang, has_chorus, category_id", { count: "exact" })
    .eq("lang", lang)
    .order("num");

  if (search) {
    query = query.or(`title.ilike.%${search}%,num.eq.${search}`);
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
  const { data, error } = await supabase
    .from("songs")
    .select("id, num, title, lang, has_chorus, category_id")
    .or(`title.ilike.%${query}%,num.ilike.%${query}%`)
    .limit(8);

  if (error) throw error;
  return data ?? [];
}
