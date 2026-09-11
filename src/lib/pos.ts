export const POS_OPTIONS = [
  { key: "n", abbr: "n.", zh: "名詞" },
  { key: "v", abbr: "v.", zh: "動詞" },
  { key: "adj", abbr: "adj.", zh: "形容詞" },
  { key: "adv", abbr: "adv.", zh: "副詞" },
  { key: "prep", abbr: "prep.", zh: "介系詞" },
  { key: "conj", abbr: "conj.", zh: "連接詞" },
  { key: "pron", abbr: "pron.", zh: "代名詞" },
  { key: "det", abbr: "det.", zh: "限定詞" },
  { key: "int", abbr: "int.", zh: "感嘆詞" },
  { key: "phr", abbr: "phr.", zh: "片語" },
] as const;

export type PosKey = (typeof POS_OPTIONS)[number]["key"];

export const POS_BY_KEY = Object.fromEntries(
  POS_OPTIONS.map((item) => [item.key, item]),
) as Record<PosKey, (typeof POS_OPTIONS)[number]>;

const ALIAS: Record<string, PosKey> = {
  n: "n",
  "n.": "n",
  noun: "n",
  名詞: "n",
  v: "v",
  "v.": "v",
  vb: "v",
  verb: "v",
  動詞: "v",
  adj: "adj",
  "adj.": "adj",
  adjective: "adj",
  形容詞: "adj",
  adv: "adv",
  "adv.": "adv",
  adverb: "adv",
  副詞: "adv",
  連接副詞: "adv",
  prep: "prep",
  "prep.": "prep",
  preposition: "prep",
  介系詞: "prep",
  介詞: "prep",
  conj: "conj",
  "conj.": "conj",
  conjunction: "conj",
  連接詞: "conj",
  pron: "pron",
  "pron.": "pron",
  pronoun: "pron",
  代名詞: "pron",
  det: "det",
  "det.": "det",
  determiner: "det",
  article: "det",
  限定詞: "det",
  冠詞: "det",
  int: "int",
  "int.": "int",
  interjection: "int",
  感嘆詞: "int",
  感歎詞: "int",
  phr: "phr",
  "phr.": "phr",
  phrase: "phr",
  phrasal: "phr",
  片語: "phr",
  片語動詞: "phr",
};

function matchToken(token: string): PosKey | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const direct = ALIAS[trimmed] ?? ALIAS[trimmed.toLowerCase()];
  if (direct) return direct;
  const compact = trimmed.toLowerCase().replace(/\s+/g, "");
  if (ALIAS[compact]) return ALIAS[compact];
  const abbr = compact.match(/^([a-z]+)\.?/);
  if (abbr?.[1] && ALIAS[abbr[1]]) return ALIAS[abbr[1]];
  const zh = trimmed.match(/[\u3400-\u9fff]+/g);
  if (zh) {
    for (const part of zh) {
      if (ALIAS[part]) return ALIAS[part];
    }
  }
  return null;
}

export function parsePos(raw: string): PosKey[] {
  if (!raw.trim()) return [];
  const keys: PosKey[] = [];
  for (const part of raw.split(/[／/、,;+|]+/)) {
    const key = matchToken(part);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

export function formatPos(keys: PosKey[]): string {
  return keys
    .map((key) => {
      const item = POS_BY_KEY[key];
      return item ? `${item.abbr} ${item.zh}` : key;
    })
    .join("／");
}

export function canonicalizePos(raw: string): string {
  const keys = parsePos(raw);
  return keys.length ? formatPos(keys) : raw.trim();
}

export function togglePosKey(raw: string, key: PosKey): string {
  const keys = parsePos(raw);
  const next = keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key];
  return formatPos(next);
}
