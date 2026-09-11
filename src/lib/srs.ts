import type { Word } from "./types";

export type Quality = 0 | 1 | 2;

const EASE_INTERVALS = [0, 1, 2, 4, 7, 14] as const;

export function nextReview(word: Word, quality: Quality, now = Date.now()) {
  let ease = word.ease;
  let intervalDays = word.intervalDays;

  if (quality === 0) {
    ease = Math.max(0, ease - 1);
    return {
      ease,
      intervalDays: 0,
      nextReviewAt: now + 10 * 60 * 1000,
      correct: false as const,
    };
  }

  if (quality === 1) {
    intervalDays = Math.max(1, intervalDays || 1);
    return {
      ease,
      intervalDays,
      nextReviewAt: now + intervalDays * 86_400_000,
      correct: true as const,
    };
  }

  ease = Math.min(5, ease + 1);
  intervalDays = EASE_INTERVALS[ease] ?? 30;
  return {
    ease,
    intervalDays,
    nextReviewAt: now + intervalDays * 86_400_000,
    correct: true as const,
  };
}

export function isDue(word: Word, now = Date.now()) {
  return word.nextReviewAt <= now;
}

export function reviewLabel(ts: number, now = Date.now()) {
  const delta = ts - now;
  if (delta <= 0) return "該複習了";
  if (delta < 60 * 60 * 1000) return "稍後";
  const days = Math.round(delta / 86_400_000);
  if (days <= 0) return "今天稍後";
  if (days === 1) return "明天";
  return `${days} 天後`;
}

export function todayKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function bumpStreak(
  lastPracticeDate: string | null,
  streak: number,
  today = todayKey(),
) {
  if (lastPracticeDate === today) {
    return { streak, lastPracticeDate: today };
  }
  const y = new Date(`${today}T12:00:00`);
  y.setDate(y.getDate() - 1);
  const yesterday = todayKey(y);
  if (lastPracticeDate === yesterday) {
    return { streak: streak + 1, lastPracticeDate: today };
  }
  return { streak: 1, lastPracticeDate: today };
}
