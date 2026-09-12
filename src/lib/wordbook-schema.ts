import { z } from "zod";

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

export const snapshotSchema = z.object({
  words: z.array(wordSchema).max(500),
  stats: statsSchema,
});

export type WordbookSnapshot = z.infer<typeof snapshotSchema>;
