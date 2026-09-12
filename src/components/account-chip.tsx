import { useState, useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const subscribeToNothing = () => () => {};
const noGateOnServer = () => false;

export function AccountChip({ className }: { className?: string }) {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  const gateSession = useSyncExternalStore(
    subscribeToNothing,
    hasGateSessionMarker,
    noGateOnServer,
  );

  if (isPending) {
    return (
      <div
        className={cn("h-8 w-24 animate-pulse rounded-full bg-line", className)}
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className={cn(
          "inline-flex h-8 items-center rounded-full bg-accent px-3 text-xs font-medium text-accent-fg",
          className,
        )}
      >
        登入
      </Link>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "帳號";

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-sm font-medium text-accent">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-28 truncate text-xs font-medium text-ink-soft sm:inline">
        {label}
      </span>
      {!gateSession ? (
        <button
          type="button"
          disabled={signingOut}
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:cursor-wait"
          onClick={() => {
            setSigningOut(true);
            void signOut().catch(() => setSigningOut(false));
          }}
        >
          {signingOut ? "登出中…" : "登出"}
        </button>
      ) : null}
    </div>
  );
}
