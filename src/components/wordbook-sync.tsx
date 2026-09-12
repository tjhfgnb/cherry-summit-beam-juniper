import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useWordStore } from "@/lib/store";
import { loadWordbook, saveWordbook } from "@/lib/wordbook-api";

export function WordbookSync() {
  const { user, isPending } = useCurrentUserState();
  const words = useWordStore((s) => s.words);
  const stats = useWordStore((s) => s.stats);
  const hydrateCloud = useWordStore((s) => s.hydrateCloud);
  const readyForUser = useRef<string | null>(null);
  const skipSave = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      readyForUser.current = null;
      return;
    }
    if (readyForUser.current === user.id) return;
    let cancelled = false;
    void (async () => {
      try {
        const cloud = await loadWordbook();
        if (cancelled) return;
        const local = useWordStore.getState();
        if (cloud.words.length === 0 && local.words.length > 0) {
          await saveWordbook({ data: { words: local.words, stats: local.stats } });
        } else if (cloud.words.length > 0) {
          skipSave.current = true;
          hydrateCloud(cloud.words, cloud.stats);
        }
        readyForUser.current = user.id;
      } catch {
        readyForUser.current = user.id;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateCloud, isPending, user]);

  useEffect(() => {
    if (!user || readyForUser.current !== user.id) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveWordbook({ data: { words, stats } }).catch(() => {});
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [stats, user, words]);

  return null;
}
