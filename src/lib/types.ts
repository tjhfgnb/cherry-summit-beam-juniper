export type WordSource = "seed" | "manual" | "translate";

export type Word = {
  id: string;
  en: string;
  zh: string;
  phonetic: string;
  pos: string;
  exampleEn: string;
  exampleZh: string;
  note: string;
  tags: string[];
  lesson: number;
  starred: boolean;
  ease: number;
  intervalDays: number;
  nextReviewAt: number;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  createdAt: number;
  updatedAt: number;
  source: WordSource;
};

export type NewWordInput = {
  en: string;
  zh: string;
  phonetic?: string;
  pos?: string;
  exampleEn?: string;
  exampleZh?: string;
  note?: string;
  tags?: string[];
  source?: WordSource;
  lesson?: number;
};

export type PracticeStats = {
  streak: number;
  lastPracticeDate: string | null;
  totalReviews: number;
};

export type LookupOk = {
  ok: true;
  sourceLang: "en" | "zh";
  targetLang: "en" | "zh";
  source: string;
  translation: string;
  phonetic: string;
  pos: string;
  examples: { en: string; zh: string }[];
  alternatives: string[];
};

export type LookupFail = { ok: false; error: string };

export type LookupResult = LookupOk | LookupFail;
