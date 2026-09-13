import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { authClient, authEnabled } from "./client";
import { getLocalUser, subscribeLocalAuth } from "./local-account";

/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  isDevFallback: boolean;
};

export const DEV_USER: AppUser = {
  id: "dev-user",
  displayName: "Dev User",
  primaryEmail: "dev@example.com",
  profileImageUrl: null,
  isDevFallback: true,
};

export type CurrentUserState = {
  user: AppUser | null;
  isPending: boolean;
};

const noLocalUser = () => null;

export function useCurrentUserState(): CurrentUserState {
  const local = useSyncExternalStore(subscribeLocalAuth, getLocalUser, noLocalUser);

  if (!authEnabled) return { user: DEV_USER, isPending: false };

  // eslint-disable-next-line react-hooks/rules-of-hooks -- authEnabled is constant
  const session = authClient.useSession();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [gaveUp, setGaveUp] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (local || !session.isPending) {
      setGaveUp((v) => (v ? false : v));
      return;
    }
    const timer = window.setTimeout(() => setGaveUp(true), 1800);
    return () => window.clearTimeout(timer);
  }, [local, session.isPending]);

  const sessionUser = session.data?.user;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const user = useMemo<AppUser | null>(() => {
    if (local) {
      return {
        id: local.id,
        displayName: local.displayName,
        primaryEmail: local.primaryEmail,
        profileImageUrl: null,
        isDevFallback: false,
      };
    }
    if (!sessionUser) return null;
    return {
      id: sessionUser.id,
      displayName: sessionUser.name ?? null,
      primaryEmail: sessionUser.email ?? null,
      profileImageUrl: sessionUser.image ?? null,
      isDevFallback: false,
    };
  }, [local, sessionUser]);

  if (local) return { user, isPending: false };

  const failed = Boolean(session.error) || gaveUp;
  return {
    user,
    isPending: failed ? false : session.isPending,
  };
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}
