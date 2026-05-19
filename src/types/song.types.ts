export type Language = "en" | "te";

export interface Stanza {
  id: string;
  song_id: string;
  label: string;
  text: string;
  translit?: string; // ← add this
  is_chorus: boolean;
  order_index: number;
}

export interface Song {
  id: string;
  num: string;
  title: string;
  lang: Language;
  has_chorus: boolean;
  translation_id: string | null;
  created_at: string;
  stanzas: Stanza[];
}

export interface SongSummary {
  id: string;
  num: string;
  title: string;
  lang: Language;
  has_chorus: boolean;
  category_id: string | null;
}
