import { useEffect, useRef, type ReactNode } from "react";
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
    if (lastName.current === name) return;
    lastName.current = name;
    useWordStore.persist.setOptions({ name });
    void useWordStore.persist.rehydrate();
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
