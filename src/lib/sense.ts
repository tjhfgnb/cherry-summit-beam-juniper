import { formatPos, parsePos } from "./pos";
import type { Word } from "./types";

const POS_ORDER = ["n", "v", "vp", "adj", "adv", "prep", "conj", "pron", "det", "int", "phr"];

export function posKey(pos: string): string {
  return parsePos(pos)[0] ?? "";
}

export function entryKey(en: string, pos: string): string {
  return `${en.trim().toLowerCase()}|${posKey(pos)}`;
}

export function splitGloss(zh: string, count: number): string[] {
  const text = zh.trim();
  if (count <= 1) return [text];
  const parts = text
    .split(/[；;／/、]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === count) return parts;
  return Array.from({ length: count }, () => text);
}

export function expandByPos<T extends { zh: string; pos?: string }>(item: T): T[] {
  const keys = parsePos(item.pos ?? "");
  if (keys.length <= 1) return [item];
  const glosses = splitGloss(item.zh, keys.length);
  return keys.map((key, i) => ({
    ...item,
    pos: formatPos([key]),
    zh: glosses[i] ?? item.zh,
  }));
}

export function splitStoredWords(words: Word[]): Word[] {
  const out: Word[] = [];
  for (const word of words) {
    const keys = parsePos(word.pos);
    if (keys.length <= 1) {
      out.push(word);
      continue;
    }
    const glosses = splitGloss(word.zh, keys.length);
    keys.forEach((key, i) => {
      out.push({
        ...word,
        id: i === 0 ? word.id : `${word.id}-${key}`,
        pos: formatPos([key]),
        zh: glosses[i] ?? word.zh,
      });
    });
  }
  const seen = new Set<string>();
  return out.filter((word) => {
    const key = entryKey(word.en, word.pos);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** 1-based label when the same spelling has more than one part of speech. */
export function senseAmong(
  item: { en: string; pos: string },
  items: { en: string; pos: string }[],
): number | null {
  const siblings = items.filter((other) => other.en.toLowerCase() === item.en.toLowerCase());
  if (siblings.length < 2) return null;
  const sorted = [...siblings].sort((a, b) => {
    const ia = POS_ORDER.indexOf(posKey(a.pos));
    const ib = POS_ORDER.indexOf(posKey(b.pos));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const index = sorted.findIndex(
    (other) => other.en.toLowerCase() === item.en.toLowerCase() && posKey(other.pos) === posKey(item.pos),
  );
  return index < 0 ? null : index + 1;
}

export function senseNumber(word: Word, words: Word[]): number | null {
  const labeled = senseAmong(word, words);
  if (labeled == null) return null;
  const siblings = words.filter((item) => item.en.toLowerCase() === word.en.toLowerCase());
  const sorted = [...siblings].sort((a, b) => {
    const ia = POS_ORDER.indexOf(posKey(a.pos));
    const ib = POS_ORDER.indexOf(posKey(b.pos));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const index = sorted.findIndex((item) => item.id === word.id);
  return index < 0 ? null : index + 1;
}
