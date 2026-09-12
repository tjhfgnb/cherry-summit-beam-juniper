import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import type { PracticeStats, Word, WordSource } from "./types";

const wordSchema = z.object({
  id: z.string().min(1).max(80),
  en: z.string().min(1).max(200),
  zh: z.string().min(1).max(400),
  phonetic: z.string().max(120).optional().default(""),
  pos: z.string().max(80).optional().default(""),
  exampleEn: z.string().max(500).optional().default(""),
  exampleZh: z.string().max(500).optional().default(""),
  note: z.string().max(500).optional().default(""),
  tags: z.array(z.string().max(40)).max(12).optional().default([]),
  starred: z.boolean().optional().default(false),
  ease: z.number().int().min(0).max(5).optional().default(0),
  intervalDays: z.number().int().min(0).max(3650).optional().default(0),
  nextReviewAt: z.number().int().optional().default(0),
  reviewCount: z.number().int().min(0).optional().default(0),
  correctCount: z.number().int().min(0).optional().default(0),
  wrongCount: z.number().int().min(0).optional().default(0),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  source: z.enum(["seed", "manual", "translate"]).optional().default("manual"),
});

const statsSchema = z.object({
  streak: z.number().int().min(0).max(10000),
  lastPracticeDate: z.string().nullable(),
  totalReviews: z.number().int().min(0),
});

const snapshotSchema = z.object({
  words: z.array(wordSchema).max(500),
  stats: statsSchema,
});

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

export const loadWordbook = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<WordRow>`
      select id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
             starred, ease, interval_days, next_review_at, review_count,
             correct_count, wrong_count, created_at, updated_at, source
      from words
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    const statsRows = await sql<{
      streak: number;
      last_practice_date: string | null;
      total_reviews: number;
    }>`
      select streak, last_practice_date, total_reviews
      from practice_stats
      where user_id = ${context.userId}
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
  });

export const saveWordbook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => snapshotSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from words where user_id = ${context.userId}`;
    for (const word of data.words) {
      await sql`
        insert into words (
          id, user_id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
          starred, ease, interval_days, next_review_at, review_count,
          correct_count, wrong_count, created_at, updated_at, source
        ) values (
          ${word.id}, ${context.userId}, ${word.en}, ${word.zh}, ${word.phonetic},
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
        ${context.userId}, ${data.stats.streak}, ${data.stats.lastPracticeDate},
        ${data.stats.totalReviews}, ${Date.now()}
      )
      on conflict (user_id) do update set
        streak = excluded.streak,
        last_practice_date = excluded.last_practice_date,
        total_reviews = excluded.total_reviews,
        updated_at = excluded.updated_at
    `;
    return { ok: true as const, count: data.words.length };
  });
