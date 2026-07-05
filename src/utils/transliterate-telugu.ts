// ── SDA HYMNAL: Telugu Transliteration Engine ────────────────────────────────
// Optimized for Christian worship song readability
// Version: 1.0 Production

// ── Consonant map ─────────────────────────────────────────────────────────────
const CONSONANTS: Record<number, string> = {
  0x0c15: "k",
  0x0c16: "kh",
  0x0c17: "g",
  0x0c18: "gh",
  0x0c19: "ng",
  0x0c1a: "ch",
  0x0c1b: "chh",
  0x0c1c: "j",
  0x0c1d: "jh",
  0x0c1e: "ny",
  0x0c1f: "t",
  0x0c20: "th",
  0x0c21: "d",
  0x0c22: "dh",
  0x0c23: "n",
  0x0c24: "th",
  0x0c25: "th",
  0x0c26: "d",
  0x0c27: "dh",
  0x0c28: "n",
  0x0c2a: "p",
  0x0c2b: "ph",
  0x0c2c: "b",
  0x0c2d: "bh",
  0x0c2e: "m",
  0x0c2f: "y",
  0x0c30: "r",
  0x0c32: "l",
  0x0c35: "v",
  0x0c36: "sh",
  0x0c37: "sh",
  0x0c38: "s",
  0x0c39: "h",
  0x0c33: "ll",
  0x0c31: "r",
};

// ── Independent vowels ────────────────────────────────────────────────────────
const VOWELS: Record<number, string> = {
  0x0c05: "a",
  0x0c06: "aa",
  0x0c07: "i",
  0x0c08: "ee",
  0x0c09: "u",
  0x0c0a: "oo",
  0x0c0e: "e",
  0x0c0f: "e",
  0x0c10: "ai",
  0x0c12: "o",
  0x0c13: "o",
  0x0c14: "au",
  0x0c0b: "ru",
};

// ── Vowel signs (matras) ──────────────────────────────────────────────────────
const MATRAS: Record<number, string> = {
  0x0c3e: "aa",
  0x0c3f: "i",
  0x0c40: "ee",
  0x0c41: "u",
  0x0c42: "oo",
  0x0c46: "e",
  0x0c47: "e",
  0x0c48: "ai",
  0x0c4a: "o",
  0x0c4b: "o",
  0x0c4c: "au",
  0x0c43: "ru",
};

const VIRAMA = 0x0c4d; // ్ halant
const ANUSVARA = 0x0c02; // ం
const VISARGA = 0x0c03; // ః

// ── String-level post-processing ──────────────────────────────────────────────
const STRING_FIXES: [RegExp, string][] = [
  [/sv/g, "sw"], // svarga → swarga
  [/ll(?=[aeiouAEIOU])/g, "l"], // double-l before vowel
];

// ── Worship word corrections dictionary ───────────────────────────────────────
const WORD_CORRECTIONS: Record<string, string> = {
  // Deity names
  devaa: "Devaa",
  devudu: "Devudu",
  devuni: "Devuni",
  yesu: "Yesu",
  yaesu: "Yesu",
  yesuv: "Yesuvu",
  prabhu: "Prabhu",
  prabhuvaa: "Prabhuvaa",
  prabhuni: "Prabhuni",
  yehova: "Yehova",
  yehovaa: "Yehova",
  yaehovaa: "Yehova",
  kristhu: "Kristhu",
  kristu: "Kristhu",
  kreesthu: "Kristhu",
  // Worship vocabulary
  sthothramul: "Sthothramul",
  sthothra: "Sthothra",
  sthuthi: "Sthuthi",
  pavithra: "Pavithra",
  aatma: "Aatma",
  swarga: "Swarga",
  swargamu: "Swargamu",
  swargamandunna: "Swargamandunna",
  swargamandunnu: "Swargamandunna",
  raksha: "Raksha",
  rakshana: "Rakshana",
  rakshakudu: "Rakshakudu",
  krupa: "Krupa",
  krupato: "Krupato",
  snehamu: "Snehamu",
  viswasamu: "Viswasamu",
  nuthana: "Nuthana",
  hallelujah: "Hallelujah",
  // Common song words
  lekkinchaleni: "Lekkinchaleni",
  lekkinchalaeni: "Lekkinchaleni",
  paadedan: "Paadedan",
  paadaedan: "Paadedan",
  ellappudu: "Ellappudu",
  elappudu: "Ellappudu",
  varaku: "Varaku",
  brathukulo: "Brathukulo",
  brathukulao: "Brathukulo",
  chesina: "Chesina",
  chaesina: "Chesina",
  chesinu: "Chesina",
  mellakai: "Mellakai",
  maellakai: "Mellakai",
  mellllakai: "Mellakai",
  nannu: "Nannu",
  mahima: "Mahima",
  mahimu: "Mahima",
  goppadi: "Goppadi",
  goppaadi: "Goppadi",
  thandree: "Thandree",
  thandri: "Thandri",
  preminchu: "Praeminchu",
  praeaminchu: "Praeminchu",
  intha: "Intha",
  inthu: "Intha",
  // Function words
  naa: "Naa",
  nee: "Nee",
  nenu: "Nenu",
  maa: "Maa",
  meemu: "Meemu",
  memu: "Memu",
  nuvvu: "Nuvvu",
};

// ── Core transliteration: one Telugu word ─────────────────────────────────────
function transliterateWord(word: string): string {
  const cps = [...word].map((c) => c.codePointAt(0) as number);
  let out = "";
  let i = 0;

  while (i < cps.length) {
    const cp = cps[i];

    if (cp === ANUSVARA) {
      const nxt = cps[i + 1];
      out +=
        nxt &&
        (CONSONANTS[nxt] === "p" ||
          CONSONANTS[nxt] === "b" ||
          CONSONANTS[nxt] === "m")
          ? "m"
          : "n";
      i++;
      continue;
    }

    if (cp === VISARGA) {
      out += "h";
      i++;
      continue;
    }

    if (CONSONANTS[cp] !== undefined) {
      const cons = CONSONANTS[cp];
      i++;
      if (i >= cps.length) {
        out += cons + "a";
        continue;
      }
      const nxt = cps[i];
      if (nxt === VIRAMA) {
        out += cons;
        i++;
        continue;
      }
      if (MATRAS[nxt] !== undefined) {
        out += cons + MATRAS[nxt];
        i++;
        continue;
      }
      out += cons + "a";
      continue;
    }

    if (VOWELS[cp] !== undefined) {
      out += VOWELS[cp];
      i++;
      continue;
    }
    if (MATRAS[cp] !== undefined) {
      out += MATRAS[cp];
      i++;
      continue;
    }
    if (cp === VIRAMA) {
      i++;
      continue;
    }

    const ch = String.fromCodePoint(cp);
    if (/[a-zA-Z0-9\-]/.test(ch)) out += ch;
    i++;
  }

  STRING_FIXES.forEach(([pat, rep]) => {
    out = out.replace(pat, rep);
  });
  return out;
}

function correctWord(raw: string): string {
  const key = raw.toLowerCase().replace(/[^a-z]/g, "");
  return WORD_CORRECTIONS[key] ?? raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ── Public API ────────────────────────────────────────────────────────────────
export function transliterateLine(line: string): string {
  return line
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      const hasTelugu = [...token].some((c) => {
        const cp = c.codePointAt(0) ?? 0;
        return cp >= 0x0c00 && cp <= 0x0c7f;
      });
      if (!hasTelugu) return token.charAt(0).toUpperCase() + token.slice(1);
      return correctWord(transliterateWord(token));
    })
    .join("");
}

export function transliterateStanza(text: string): string {
  return text.split("\n").map(transliterateLine).join("\n");
}
