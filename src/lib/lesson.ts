export function clampLesson(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.min(99, Math.floor(n));
}

export function formatLesson(n: number): string {
  return n > 0 ? `第${n}課` : "未分課";
}

/** Whole-line headers: 第1課 / 第2客 / Lesson 3 / # 4 */
export function parseLessonHeader(line: string): number | null {
  const t = line.trim().replace(/[：:]+$/, "");
  const zh = t.match(/^(?:#\s*)?第\s*(\d{1,2})\s*[課客]?\s*$/);
  if (zh) return clampLesson(Number(zh[1]));
  const en = t.match(/^(?:#\s*)?(?:lesson|unit|l)\s*(\d{1,2})$/i);
  if (en) return clampLesson(Number(en[1]));
  const hash = t.match(/^#\s*(\d{1,2})$/);
  if (hash) return clampLesson(Number(hash[1]));
  return null;
}

export function stripInlineLesson(line: string): { rest: string; lesson: number | null } {
  let lesson: number | null = null;
  const rest = line
    .replace(/第\s*(\d{1,2})\s*[課客]/g, (_, n: string) => {
      lesson = clampLesson(Number(n));
      return " ";
    })
    .replace(/\s+/g, " ")
    .trim();
  return { rest, lesson };
}

export function uniqueLessons(values: number[]): number[] {
  const set = new Set(values.filter((n) => n > 0));
  return [...set].sort((a, b) => a - b);
}
