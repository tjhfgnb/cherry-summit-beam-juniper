import { useEffect, type ReactNode } from "react";
import { persistNameForUser } from "./local-account";
import { useCurrentUserState } from "./use-current-user";
import { useWordStore } from "@/lib/store";

function LocalBookScope() {
  const { user, isPending } = useCurrentUserState();
  useEffect(() => {
    if (isPending) return;
    const name = persistNameForUser(user && !user.isDevFallback ? user.id : null);
    useWordStore.persist.setOptions({ name });
    void useWordStore.persist.rehydrate();
  }, [isPending, user]);
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
