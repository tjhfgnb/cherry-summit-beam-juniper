import type { PracticeStats, Word, WordSource } from "./types";
import { snapshotSchema, type WordbookSnapshot } from "./wordbook-schema";

export { snapshotSchema, type WordbookSnapshot };

type WordRow = {
  id: string;
  en: string;
  zh: string;
  phonetic: string;
  pos: string;
  example_en: string;
  example_zh: string;
  note: string;
  tags: string;
  starred: boolean | number;
  ease: number;
  interval_days: number;
  next_review_at: number;
  review_count: number;
  correct_count: number;
  wrong_count: number;
  created_at: number;
  updated_at: number;
  source: string;
};

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function rowToWord(row: WordRow): Word {
  const source = (["seed", "manual", "translate"] as const).includes(row.source as WordSource)
    ? (row.source as WordSource)
    : "manual";
  return {
    id: row.id,
    en: row.en,
    zh: row.zh,
    phonetic: row.phonetic ?? "",
    pos: row.pos ?? "",
    exampleEn: row.example_en ?? "",
    exampleZh: row.example_zh ?? "",
    note: row.note ?? "",
    tags: parseTags(row.tags ?? "[]"),
    starred: Boolean(row.starred),
    ease: Number(row.ease) || 0,
    intervalDays: Number(row.interval_days) || 0,
    nextReviewAt: Number(row.next_review_at) || 0,
    reviewCount: Number(row.review_count) || 0,
    correctCount: Number(row.correct_count) || 0,
    wrongCount: Number(row.wrong_count) || 0,
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0,
    source,
  };
}

export async function loadWordbookData(userId: string): Promise<WordbookSnapshot> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<WordRow>`
    select id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
           starred, ease, interval_days, next_review_at, review_count,
           correct_count, wrong_count, created_at, updated_at, source
    from words
    where user_id = ${userId}
    order by updated_at desc
  `;
  const statsRows = await sql<{
    streak: number;
    last_practice_date: string | null;
    total_reviews: number;
  }>`
    select streak, last_practice_date, total_reviews
    from practice_stats
    where user_id = ${userId}
    limit 1
  `;
  const statsRow = statsRows[0];
  const stats: PracticeStats = statsRow
    ? {
        streak: Number(statsRow.streak) || 0,
        lastPracticeDate: statsRow.last_practice_date,
        totalReviews: Number(statsRow.total_reviews) || 0,
      }
    : { streak: 0, lastPracticeDate: null, totalReviews: 0 };
  return { words: rows.map(rowToWord), stats };
}

export async function saveWordbookData(userId: string, data: WordbookSnapshot) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`delete from words where user_id = ${userId}`;
  for (const word of data.words) {
    await sql`
      insert into words (
        id, user_id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
        starred, ease, interval_days, next_review_at, review_count,
        correct_count, wrong_count, created_at, updated_at, source
      ) values (
        ${word.id}, ${userId}, ${word.en}, ${word.zh}, ${word.phonetic},
        ${word.pos}, ${word.exampleEn}, ${word.exampleZh}, ${word.note},
        ${JSON.stringify(word.tags)}, ${word.starred}, ${word.ease},
        ${word.intervalDays}, ${word.nextReviewAt}, ${word.reviewCount},
        ${word.correctCount}, ${word.wrongCount}, ${word.createdAt},
        ${word.updatedAt}, ${word.source}
      )
    `;
  }
  await sql`
    insert into practice_stats (user_id, streak, last_practice_date, total_reviews, updated_at)
    values (
      ${userId}, ${data.stats.streak}, ${data.stats.lastPracticeDate},
      ${data.stats.totalReviews}, ${Date.now()}
    )
    on conflict (user_id) do update set
      streak = excluded.streak,
      last_practice_date = excluded.last_practice_date,
      total_reviews = excluded.total_reviews,
      updated_at = excluded.updated_at
  `;
  return { ok: true as const, count: data.words.length };
}
