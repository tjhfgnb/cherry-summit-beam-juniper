import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { canonicalizePos, formatPos, parsePos } from "./pos";
import { mergeGloss } from "./bulk";
import { clampLesson } from "./lesson";
import type { NewWordInput, PracticeStats, Word } from "./types";
import { buildSeedWords } from "./seed-words";
import { bumpStreak, nextReview, type Quality } from "./srs";

type AddResult = { word: Word; duplicated: boolean };

type WordState = {
  words: Word[];
  stats: PracticeStats;
  selectedIds: string[];
  addWord: (input: NewWordInput) => AddResult;
  importMany: (items: NewWordInput[]) => { added: number; merged: number; ids: string[] };
  updateWord: (id: string, patch: Partial<Word>) => void;
  removeWord: (id: string) => void;
  removeMany: (ids: string[]) => number;
  toggleStar: (id: string) => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
  clearSelected: () => void;
  recordReview: (id: string, quality: Quality) => void;
  restoreSeed: () => number;
  markPracticedToday: () => void;
  hydrateCloud: (words: Word[], stats: PracticeStats) => void;
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
          if (zh) patch.zh = mergeGloss(existing.zh, zh);
          if (input.phonetic && !existing.phonetic) patch.phonetic = input.phonetic;
          if (input.exampleEn && !existing.exampleEn) patch.exampleEn = input.exampleEn;
          if (input.exampleZh && !existing.exampleZh) patch.exampleZh = input.exampleZh;
          if (input.pos) {
            patch.pos = formatPos([...parsePos(existing.pos), ...parsePos(input.pos)]);
          }
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
          lesson: clampLesson(input.lesson ?? 0),
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
      importMany: (items) => {
        const ids: string[] = [];
        let added = 0;
        let merged = 0;
        let words = get().words;
        for (const input of items) {
          const en = normalizeEn(input.en);
          const zh = input.zh.trim();
          if (!en || !zh) continue;
          const existing = words.find((w) => w.en.toLowerCase() === en.toLowerCase());
          if (existing) {
            words = words.map((w) =>
              w.id === existing.id
                ? {
                    ...w,
                    zh: mergeGloss(w.zh, zh),
                    pos: formatPos([...parsePos(w.pos), ...parsePos(input.pos ?? "")]),
                    phonetic: w.phonetic || input.phonetic?.trim() || "",
                    exampleEn: w.exampleEn || input.exampleEn?.trim() || "",
                    exampleZh: w.exampleZh || input.exampleZh?.trim() || "",
                    lesson: w.lesson || clampLesson(input.lesson ?? 0),
                    updatedAt: Date.now(),
                  }
                : w,
            );
            ids.push(existing.id);
            merged += 1;
          } else {
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
              lesson: clampLesson(input.lesson ?? 0),
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
            words = [word, ...words];
            ids.push(word.id);
            added += 1;
          }
        }
        set((s) => ({
          words,
          selectedIds: [...new Set([...ids, ...s.selectedIds])],
        }));
        return { added, merged, ids };
      },
      updateWord: (id, patch) => {
        const next =
          patch.pos !== undefined
            ? { ...patch, pos: canonicalizePos(patch.pos) }
            : patch;
        const withLesson =
          next.lesson !== undefined ? { ...next, lesson: clampLesson(next.lesson) } : next;
        set((s) => ({
          words: s.words.map((w) =>
            w.id === id ? { ...w, ...withLesson, id: w.id, updatedAt: Date.now() } : w,
          ),
        }));
      },
      removeWord: (id) => {
        set((s) => ({
          words: s.words.filter((w) => w.id !== id),
          selectedIds: s.selectedIds.filter((x) => x !== id),
        }));
      },
      removeMany: (ids) => {
        const drop = new Set(ids);
        const before = get().words.length;
        set((s) => ({
          words: s.words.filter((w) => !drop.has(w.id)),
          selectedIds: s.selectedIds.filter((x) => !drop.has(x)),
        }));
        return before - get().words.length;
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
      hydrateCloud: (words, stats) => {
        set({
          words: words.map((w) => ({ ...w, lesson: clampLesson(w.lesson ?? 0) })),
          stats,
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
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<WordState, "words" | "stats">>;
        const words = (p.words ?? current.words).map((w) => ({
          ...w,
          lesson: clampLesson(w.lesson ?? 0),
        }));
        return {
          ...current,
          ...p,
          words,
          selectedIds: current.selectedIds,
        };
      },
    },
  ),
);
