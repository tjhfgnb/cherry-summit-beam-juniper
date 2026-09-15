import { formatPos, parsePos, type PosKey } from "./pos";
import { clampLesson, parseLessonHeader, stripInlineLesson } from "./lesson";

export type BulkGroup = {
  en: string;
  zh: string;
  pos: string;
  posKeys: PosKey[];
  count: number;
  lesson: number;
};

export type BulkParse = {
  groups: BulkGroup[];
  skipped: { line: string; reason: string }[];
};

function uniquePos(keys: PosKey[]): PosKey[] {
  const out: PosKey[] = [];
  for (const key of keys) {
    if (!out.includes(key)) out.push(key);
  }
  return out;
}

export function mergeGloss(a: string, b: string): string {
  const parts = [...a.split(/[／/、;；,，]+/), ...b.split(/[／/、;；,，]+/)]
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (!out.includes(part)) out.push(part);
  }
  return out.join("／");
}

function normalizeEn(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function pullPos(line: string): { rest: string; keys: PosKey[] } {
  const keys: PosKey[] = [];
  const rest = line
    .replace(/[（(]([^）)]*)[）)]/g, (_, inner: string) => {
      const found = parsePos(String(inner));
      if (found.length) {
        keys.push(...found);
        return " ";
      }
      return `(${inner})`;
    })
    .replace(/\s+/g, " ")
    .trim();
  return { rest, keys: uniquePos(keys) };
}

function splitEnZh(rest: string): { en: string; zh: string } {
  const idx = rest.search(/[\u3400-\u9fff]/);
  if (idx === 0) {
    const split = rest.search(/[A-Za-z]/);
    if (split === -1) return { en: "", zh: rest.trim() };
    return { zh: rest.slice(0, split).trim(), en: rest.slice(split).trim() };
  }
  if (idx > 0) {
    return { en: rest.slice(0, idx).trim(), zh: rest.slice(idx).trim() };
  }
  const parts = rest.split(/\t+| {2,}|[|｜]+/);
  if (parts.length >= 2) {
    return { en: parts[0]!.trim(), zh: parts.slice(1).join(" ").trim() };
  }
  return { en: rest.trim(), zh: "" };
}

export function parseBulkText(raw: string, fallbackLesson = 0): BulkParse {
  const groups = new Map<string, BulkGroup>();
  const skipped: BulkParse["skipped"] = [];
  let currentLesson = clampLesson(fallbackLesson);

  for (const original of raw.split(/\r?\n/)) {
    const line = original.trim();
    if (!line || line.startsWith("//")) continue;

    const header = parseLessonHeader(line);
    if (header !== null) {
      currentLesson = header;
      continue;
    }
    if (line.startsWith("#")) continue;

    const inline = stripInlineLesson(line);
    const { rest, keys } = pullPos(inline.rest);
    const lesson = inline.lesson ?? currentLesson;
    if (!rest) {
      skipped.push({ line, reason: "這行只有詞性，沒有單字" });
      continue;
    }

    const split = splitEnZh(rest);
    const en = normalizeEn(split.en.replace(/^[-•·\d.)、]+\s*/, ""));
    const zh = split.zh.replace(/[。．.]+$/, "").trim();

    if (!en) {
      skipped.push({ line, reason: "找不到英文" });
      continue;
    }
    if (!/[A-Za-z]/.test(en)) {
      skipped.push({ line, reason: "找不到英文" });
      continue;
    }
    if (!zh) {
      skipped.push({ line, reason: "找不到中文" });
      continue;
    }

    const key = en.toLowerCase();
    const prev = groups.get(key);
    if (prev) {
      prev.zh = mergeGloss(prev.zh, zh);
      prev.posKeys = uniquePos([...prev.posKeys, ...keys]);
      prev.pos = formatPos(prev.posKeys);
      prev.count += 1;
      if (!prev.lesson && lesson) prev.lesson = lesson;
    } else {
      groups.set(key, {
        en,
        zh,
        posKeys: keys,
        pos: formatPos(keys),
        count: 1,
        lesson,
      });
    }
  }

  return { groups: [...groups.values()], skipped };
}
