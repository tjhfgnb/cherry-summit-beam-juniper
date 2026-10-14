import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { canonicalizePos } from "./pos";
import { mergeGloss } from "./bulk";
import { clampLesson } from "./lesson";
import { entryKey, expandByPos, splitStoredWords } from "./sense";
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
        const pieces = expandByPos({
          ...input,
          en: normalizeEn(input.en),
          zh: input.zh.trim(),
        }).filter((item) => item.en && item.zh);
        if (!pieces.length) throw new Error("需要英文與中文");
        let last: AddResult | null = null;
        for (const piece of pieces) {
          const existing = get().words.find(
            (w) => entryKey(w.en, w.pos) === entryKey(piece.en, piece.pos ?? ""),
          );
          if (existing) {
            const patch: Partial<Word> = { updatedAt: Date.now() };
            if (piece.zh) patch.zh = mergeGloss(existing.zh, piece.zh);
            if (piece.phonetic && !existing.phonetic) patch.phonetic = piece.phonetic;
            if (piece.exampleEn && !existing.exampleEn) patch.exampleEn = piece.exampleEn;
            if (piece.exampleZh && !existing.exampleZh) patch.exampleZh = piece.exampleZh;
            if (piece.pos) patch.pos = canonicalizePos(piece.pos);
            get().updateWord(existing.id, patch);
            const updated = get().words.find((w) => w.id === existing.id) ?? existing;
            last = { word: updated, duplicated: true };
            continue;
          }
          const now = Date.now();
          const word: Word = {
            id: makeId(),
            en: piece.en,
            zh: piece.zh,
            phonetic: piece.phonetic?.trim() ?? "",
            pos: canonicalizePos(piece.pos ?? ""),
            exampleEn: piece.exampleEn?.trim() ?? "",
            exampleZh: piece.exampleZh?.trim() ?? "",
            note: piece.note?.trim() ?? "",
            tags: piece.tags ?? [],
            lesson: clampLesson(piece.lesson ?? 0),
            starred: false,
            ease: 0,
            intervalDays: 0,
            nextReviewAt: 0,
            reviewCount: 0,
            correctCount: 0,
            wrongCount: 0,
            createdAt: now,
            updatedAt: now,
            source: piece.source ?? "manual",
          };
          set((s) => ({ words: [word, ...s.words] }));
          last = { word, duplicated: false };
        }
        return last!;
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
          for (const piece of expandByPos({ ...input, en, zh })) {
          const existing = words.find(
            (w) => entryKey(w.en, w.pos) === entryKey(piece.en, piece.pos ?? ""),
          );
          if (existing) {
            words = words.map((w) =>
              w.id === existing.id
                ? {
                    ...w,
                    zh: mergeGloss(w.zh, piece.zh),
                    pos: canonicalizePos(piece.pos ?? w.pos),
                    phonetic: w.phonetic || piece.phonetic?.trim() || "",
                    exampleEn: w.exampleEn || piece.exampleEn?.trim() || "",
                    exampleZh: w.exampleZh || piece.exampleZh?.trim() || "",
                    lesson: w.lesson || clampLesson(piece.lesson ?? 0),
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
              en: piece.en,
              zh: piece.zh,
              phonetic: piece.phonetic?.trim() ?? "",
              pos: canonicalizePos(piece.pos ?? ""),
              exampleEn: piece.exampleEn?.trim() ?? "",
              exampleZh: piece.exampleZh?.trim() ?? "",
              note: piece.note?.trim() ?? "",
              tags: piece.tags ?? [],
              lesson: clampLesson(piece.lesson ?? 0),
              starred: false,
              ease: 0,
              intervalDays: 0,
              nextReviewAt: 0,
              reviewCount: 0,
              correctCount: 0,
              wrongCount: 0,
              createdAt: now,
              updatedAt: now,
              source: piece.source ?? "manual",
            };
            words = [word, ...words];
            ids.push(word.id);
            added += 1;
          }
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
        const existing = new Set(get().words.map((w) => entryKey(w.en, w.pos)));
        const missing = buildSeedWords().filter(
          (w) => !existing.has(entryKey(w.en, w.pos)),
        );
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
          words: splitStoredWords(
            words.map((w) => ({ ...w, lesson: clampLesson(w.lesson ?? 0) })),
          ),
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
        const words = splitStoredWords(
          (p.words ?? current.words).map((w) => ({
            ...w,
            lesson: clampLesson(w.lesson ?? 0),
          })),
        );
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
