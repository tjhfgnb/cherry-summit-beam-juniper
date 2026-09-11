import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { canonicalizePos } from "./pos";
import type { NewWordInput, PracticeStats, Word } from "./types";
import { buildSeedWords } from "./seed-words";
import { bumpStreak, nextReview, type Quality } from "./srs";

type AddResult = { word: Word; duplicated: boolean };

type WordState = {
  words: Word[];
  stats: PracticeStats;
  selectedIds: string[];
  addWord: (input: NewWordInput) => AddResult;
  updateWord: (id: string, patch: Partial<Word>) => void;
  removeWord: (id: string) => void;
  toggleStar: (id: string) => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
  clearSelected: () => void;
  recordReview: (id: string, quality: Quality) => void;
  restoreSeed: () => number;
  markPracticedToday: () => void;
};

function normalizeEn(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const emptyStats: PracticeStats = {
  streak: 0,
  lastPracticeDate: null,
  totalReviews: 0,
};

const memoryStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

export const useWordStore = create<WordState>()(
  persist(
    (set, get) => ({
      words: buildSeedWords(),
      stats: emptyStats,
      selectedIds: [],
      addWord: (input) => {
        const en = normalizeEn(input.en);
        const zh = input.zh.trim();
        if (!en || !zh) {
          throw new Error("需要英文與中文");
        }
        const existing = get().words.find(
          (w) => w.en.toLowerCase() === en.toLowerCase(),
        );
        if (existing) {
          const patch: Partial<Word> = { updatedAt: Date.now() };
          if (zh && zh !== existing.zh) patch.zh = zh;
          if (input.phonetic && !existing.phonetic) patch.phonetic = input.phonetic;
          if (input.exampleEn && !existing.exampleEn) patch.exampleEn = input.exampleEn;
          if (input.exampleZh && !existing.exampleZh) patch.exampleZh = input.exampleZh;
          if (input.pos && !existing.pos) patch.pos = canonicalizePos(input.pos);
          get().updateWord(existing.id, patch);
          const updated = get().words.find((w) => w.id === existing.id) ?? existing;
          return { word: updated, duplicated: true };
        }
        const now = Date.now();
        const word: Word = {
          id: makeId(),
          en,
          zh,
          phonetic: input.phonetic?.trim() ?? "",
          pos: canonicalizePos(input.pos ?? ""),
          exampleEn: input.exampleEn?.trim() ?? "",
          exampleZh: input.exampleZh?.trim() ?? "",
          note: input.note?.trim() ?? "",
          tags: input.tags ?? [],
          starred: false,
          ease: 0,
          intervalDays: 0,
          nextReviewAt: 0,
          reviewCount: 0,
          correctCount: 0,
          wrongCount: 0,
          createdAt: now,
          updatedAt: now,
          source: input.source ?? "manual",
        };
        set((s) => ({ words: [word, ...s.words] }));
        return { word, duplicated: false };
      },
      updateWord: (id, patch) => {
        const next = patch.pos !== undefined ? { ...patch, pos: canonicalizePos(patch.pos) } : patch;
        set((s) => ({
          words: s.words.map((w) =>
            w.id === id ? { ...w, ...next, id: w.id, updatedAt: Date.now() } : w,
          ),
        }));
      },
      removeWord: (id) => {
        set((s) => ({
          words: s.words.filter((w) => w.id !== id),
          selectedIds: s.selectedIds.filter((x) => x !== id),
        }));
      },
      toggleStar: (id) => {
        set((s) => ({
          words: s.words.map((w) =>
            w.id === id ? { ...w, starred: !w.starred, updatedAt: Date.now() } : w,
          ),
        }));
      },
      toggleSelected: (id) => {
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((x) => x !== id)
            : [...s.selectedIds, id],
        }));
      },
      setSelected: (ids) => {
        set({ selectedIds: [...new Set(ids)] });
      },
      clearSelected: () => {
        set({ selectedIds: [] });
      },
      recordReview: (id, quality) => {
        const word = get().words.find((w) => w.id === id);
        if (!word) return;
        const result = nextReview(word, quality);
        set((s) => ({
          words: s.words.map((w) =>
            w.id === id
              ? {
                  ...w,
                  ease: result.ease,
                  intervalDays: result.intervalDays,
                  nextReviewAt: result.nextReviewAt,
                  reviewCount: w.reviewCount + 1,
                  correctCount: w.correctCount + (result.correct ? 1 : 0),
                  wrongCount: w.wrongCount + (result.correct ? 0 : 1),
                  updatedAt: Date.now(),
                }
              : w,
          ),
          stats: {
            ...s.stats,
            totalReviews: s.stats.totalReviews + 1,
          },
        }));
      },
      restoreSeed: () => {
        const existing = new Set(get().words.map((w) => w.en.toLowerCase()));
        const missing = buildSeedWords().filter((w) => !existing.has(w.en.toLowerCase()));
        if (missing.length) {
          set((s) => ({ words: [...missing, ...s.words] }));
        }
        return missing.length;
      },
      markPracticedToday: () => {
        set((s) => {
          const next = bumpStreak(s.stats.lastPracticeDate, s.stats.streak);
          return { stats: { ...s.stats, ...next } };
        });
      },
    }),
    {
      name: "yingxiben-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : localStorage,
      ),
      partialize: (s) => ({
        words: s.words,
        stats: s.stats,
        selectedIds: s.selectedIds,
      }),
    },
  ),
);
