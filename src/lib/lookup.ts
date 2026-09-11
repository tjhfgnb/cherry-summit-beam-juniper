import type { LookupOk, LookupResult } from "./types";
import { canonicalizePos, formatPos, type PosKey } from "./pos";

type Hint = "auto" | "en" | "zh";

const POS_FROM_EN: Record<string, PosKey> = {
  noun: "n",
  "proper noun": "n",
  verb: "v",
  adjective: "adj",
  adverb: "adv",
  preposition: "prep",
  conjunction: "conj",
  pronoun: "pron",
  determiner: "det",
  article: "det",
  interjection: "int",
  exclamation: "int",
  phrase: "phr",
  proverb: "phr",
  idiom: "phr",
  "phrasal verb": "phr",
};

const CACHE_KEY = "yingxiben-lookup-v2";
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const memoryCache = new Map<string, LookupOk>();
const inflight = new Map<string, Promise<LookupResult>>();

function hasCjk(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

function detectLang(text: string, hint?: Hint): "en" | "zh" {
  if (hint === "en" || hint === "zh") return hint;
  return hasCjk(text) ? "zh" : "en";
}

function cacheKey(text: string, hint?: Hint) {
  return `${hint ?? "auto"}:${text.trim().toLowerCase()}`;
}

function readPersisted(key: string): LookupOk | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, { at: number; result: LookupOk }>;
    const hit = all[key];
    if (!hit || Date.now() - hit.at > CACHE_TTL_MS) return null;
    return hit.result;
  } catch {
    return null;
  }
}

function writePersisted(key: string, result: LookupOk) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, { at: number; result: LookupOk }>) : {};
    all[key] = { at: Date.now(), result };
    const keys = Object.keys(all);
    if (keys.length > 80) {
      keys
        .sort((a, b) => (all[a]?.at ?? 0) - (all[b]?.at ?? 0))
        .slice(0, keys.length - 80)
        .forEach((k) => {
          delete all[k];
        });
    }
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchJson(url: string, timeout: number): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("text/html")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function parseGoogleTranslate(payload: unknown): string | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;
  const first = payload[0];
  if (typeof first === "string" && first.trim()) return first.trim();
  if (Array.isArray(first) && typeof first[0] === "string" && first[0].trim()) {
    return first[0].trim();
  }
  return null;
}

async function translateText(text: string, from: "en" | "zh", to: "en" | "zh"): Promise<string | null> {
  const sl = from === "zh" ? "zh-TW" : "en";
  const tl = to === "zh" ? "zh-TW" : "en";
  const url = new URL("https://clients5.google.com/translate_a/t");
  url.searchParams.set("client", "dict-chrome-ex");
  url.searchParams.set("sl", sl);
  url.searchParams.set("tl", tl);
  url.searchParams.set("q", text);
  const parsed = parseGoogleTranslate(await fetchJson(url.toString(), 4000));
  if (!parsed) return null;
  if (parsed.toLowerCase() === text.trim().toLowerCase() && from !== to) return null;
  return parsed;
}

type WikiSense = {
  partOfSpeech?: string;
  definitions?: {
    examples?: string[];
    parsedExamples?: { example?: string }[];
  }[];
};

async function lookupWiktionary(english: string): Promise<{
  pos: string;
  phonetic: string;
  exampleEn: string;
}> {
  const title = english.trim().toLowerCase().replace(/\s+/g, "_");
  if (!title) return { pos: "", phonetic: "", exampleEn: "" };

  const defPayload = await fetchJson(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(title)}`,
    2800,
  );

  const keys: PosKey[] = [];
  let exampleEn = "";
  const entries = (defPayload as { en?: WikiSense[] } | null)?.en ?? [];
  for (const entry of entries) {
    const mapped = POS_FROM_EN[(entry.partOfSpeech ?? "").trim().toLowerCase()];
    if (mapped && !keys.includes(mapped)) keys.push(mapped);
    if (!exampleEn) {
      const sense = entry.definitions?.[0];
      const raw = sense?.parsedExamples?.[0]?.example || sense?.examples?.[0] || "";
      exampleEn = stripHtml(raw);
    }
  }
  if (english.trim().includes(" ") && !keys.includes("phr")) keys.push("phr");

  return { pos: formatPos(keys), phonetic: "", exampleEn };
}

function emptyExtras() {
  return { pos: "", phonetic: "", exampleEn: "" };
}

export async function lookupPhrase(input: {
  text?: string;
  hint?: Hint;
  data?: { text: string; hint?: Hint };
  onPartial?: (result: LookupOk) => void;
}): Promise<LookupResult> {
  const body = input.data ?? input;
  const text = body.text?.trim() ?? "";
  if (!text) return { ok: false, error: "先輸入要翻譯的文字。" };
  if (text.length > 400) return { ok: false, error: "文字太長，請縮短後再試。" };

  const key = cacheKey(text, body.hint);
  const cached = memoryCache.get(key) ?? readPersisted(key);
  if (cached) {
    memoryCache.set(key, cached);
    input.onPartial?.(cached);
    return cached;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const task = (async (): Promise<LookupResult> => {
    const sourceLang = detectLang(text, body.hint);
    const targetLang = sourceLang === "en" ? "zh" : "en";

    try {
      const extrasP =
        sourceLang === "en"
          ? lookupWiktionary(text).catch(() => emptyExtras())
          : Promise.resolve(null);

      const translation = await translateText(text, sourceLang, targetLang);
      if (!translation) {
        return { ok: false, error: "找不到翻譯，請改為手動填入中英文。" };
      }

      const partial: LookupOk = {
        ok: true,
        sourceLang,
        targetLang,
        source: text,
        translation,
        phonetic: "",
        pos: "",
        examples: [],
        alternatives: [],
      };
      input.onPartial?.(partial);

      const extras =
        (await extrasP) ?? (await lookupWiktionary(translation).catch(() => emptyExtras()));

      const full: LookupOk = {
        ...partial,
        phonetic: extras.phonetic,
        pos: canonicalizePos(extras.pos),
        examples: extras.exampleEn ? [{ en: extras.exampleEn, zh: "" }] : [],
      };
      input.onPartial?.(full);
      memoryCache.set(key, full);
      writePersisted(key, full);
      return full;
    } catch {
      return { ok: false, error: "翻譯失敗，請稍後再試，或改為手動新增。" };
    }
  })();

  inflight.set(key, task);
  try {
    return await task;
  } finally {
    inflight.delete(key);
  }
}
