import { useEffect, useRef, type ReactNode } from "react";
import { bookReadyName, markBookReady } from "@/lib/book-ready";
import { persistNameForUser } from "./local-account";
import { useCurrentUserState } from "./use-current-user";
import { useWordStore } from "@/lib/store";

function LocalBookScope() {
  const { user, isPending } = useCurrentUserState();
  const userId = user && !user.isDevFallback ? user.id : null;
  const lastName = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    const name = persistNameForUser(userId);
    if (lastName.current === name && bookReadyName() === name) return;
    lastName.current = name;
    useWordStore.persist.setOptions({ name });
    void Promise.resolve(useWordStore.persist.rehydrate()).then(() => {
      if (lastName.current === name) markBookReady(name);
    });
  }, [isPending, userId]);

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <LocalBookScope />
      {children}
    </>
  );
}
