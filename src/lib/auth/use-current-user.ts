import { useEffect, useState, useSyncExternalStore } from "react";
import { authClient, authEnabled } from "./client";
import { getLocalUser, subscribeLocalAuth } from "./local-account";

/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  /** True when this is the sandbox/dev fallback (auth not configured). */
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

function toAppUser(user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): AppUser {
  return {
    id: user.id,
    displayName: user.name ?? null,
    primaryEmail: user.email ?? null,
    profileImageUrl: user.image ?? null,
    isDevFallback: false,
  };
}

export function useCurrentUserState(): CurrentUserState {
  const local = useSyncExternalStore(subscribeLocalAuth, getLocalUser, () => null);

  if (!authEnabled) return { user: DEV_USER, isPending: false };

  // eslint-disable-next-line react-hooks/rules-of-hooks -- authEnabled is constant
  const session = authClient.useSession();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [gaveUp, setGaveUp] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (local || !session.isPending) {
      setGaveUp(false);
      return;
    }
    const timer = window.setTimeout(() => setGaveUp(true), 1800);
    return () => window.clearTimeout(timer);
  }, [local, session.isPending]);

  if (local) {
    return {
      user: {
        id: local.id,
        displayName: local.displayName,
        primaryEmail: local.primaryEmail,
        profileImageUrl: null,
        isDevFallback: false,
      },
      isPending: false,
    };
  }

  const user = session.data?.user;
  const failed = Boolean(session.error) || gaveUp;
  return {
    user: user ? toAppUser(user) : null,
    isPending: failed ? false : session.isPending,
  };
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}
