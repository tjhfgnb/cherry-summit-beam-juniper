import { useEffect, useRef, useSyncExternalStore } from "react";
import { bookReadyName, subscribeBookReady } from "@/lib/book-ready";
import { persistNameForUser } from "@/lib/auth/local-account";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useWordStore } from "@/lib/store";
import { loadWordbook, saveWordbook } from "@/lib/wordbook-api";
import type { PracticeStats, Word } from "@/lib/types";

function mergeWords(local: Word[], cloud: Word[]) {
  const byId = new Map<string, Word>();
  for (const word of cloud) byId.set(word.id, word);
  for (const word of local) {
    const prev = byId.get(word.id);
    if (!prev || word.updatedAt >= prev.updatedAt) byId.set(word.id, word);
  }
  return [...byId.values()];
}

function pickStats(local: PracticeStats, cloud: PracticeStats) {
  return local.totalReviews >= cloud.totalReviews ? local : cloud;
}

export function WordbookSync() {
  const { user, isPending } = useCurrentUserState();
  const userId = user && !user.isDevFallback ? user.id : null;
  const readyName = useSyncExternalStore(subscribeBookReady, bookReadyName, () => null);
  const words = useWordStore((s) => s.words);
  const stats = useWordStore((s) => s.stats);
  const hydrateCloud = useWordStore((s) => s.hydrateCloud);
  const readyForUser = useRef<string | null>(null);
  const skipSave = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (!userId) {
      readyForUser.current = null;
      return;
    }
    const bookName = persistNameForUser(userId);
    if (readyName !== bookName || readyForUser.current === userId) return;
    let cancelled = false;
    void (async () => {
      try {
        const cloud = await loadWordbook();
        if (cancelled) return;
        const local = useWordStore.getState();
        const merged = mergeWords(local.words, cloud.words);
        const nextStats = pickStats(local.stats, cloud.stats);
        skipSave.current = true;
        hydrateCloud(merged, nextStats);
        readyForUser.current = userId;
        const same =
          merged.length === cloud.words.length &&
          merged.every((word) => {
            const prev = cloud.words.find((item) => item.id === word.id);
            return prev && prev.updatedAt === word.updatedAt && prev.zh === word.zh;
          });
        if (!same) {
          await saveWordbook({ data: { words: merged, stats: nextStats } });
        }
      } catch {
        readyForUser.current = userId;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateCloud, isPending, readyName, userId]);

  useEffect(() => {
    if (!userId || readyForUser.current !== userId) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveWordbook({ data: { words, stats } }).catch(() => {});
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [stats, userId, words]);

  return null;
}
