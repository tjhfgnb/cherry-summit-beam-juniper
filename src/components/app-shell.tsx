import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Languages, ListPlus, Repeat } from "lucide-react";
import { Toaster } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { isDue } from "@/lib/srs";
import { useWordStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "單字本", icon: BookOpen },
  { to: "/add", label: "速加", icon: ListPlus },
  { to: "/translate", label: "翻譯", icon: Languages },
  { to: "/practice", label: "練習", icon: Repeat },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dueCount = useWordStore((s) => s.words.filter((w) => isDue(w)).length);
  const streak = useWordStore((s) => s.stats.streak);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface/80 px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-1">
          <BrandMark />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight">
              英習本
            </span>
            <span className="block text-xs uppercase tracking-widest text-muted">
              Wordbook
            </span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-accent text-accent-fg"
                    : "text-ink-soft hover:bg-accent-soft/70",
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {item.to === "/practice" && dueCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto tabular-nums text-xs",
                      active ? "text-accent-fg/80" : "text-muted",
                    )}
                  >
                    {dueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-xl bg-bg-warm px-3 py-3">
          <p className="text-xs uppercase tracking-widest text-faint">連續練習</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight">
            {streak}
            <span className="ml-1 text-sm font-sans font-medium text-muted">天</span>
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-2.5 border-b border-line bg-bg/90 px-4 backdrop-blur-sm md:hidden">
        <BrandMark className="size-7" />
        <div className="leading-tight">
          <p className="font-display text-base font-semibold tracking-tight">英習本</p>
          <p className="text-xs uppercase tracking-widest text-muted">Wordbook</p>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 md:ml-56 md:px-8 md:pb-12 md:pt-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {item.label}
                {item.to === "/practice" && dueCount > 0 && (
                  <span className="absolute right-1/4 top-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-xs leading-4 text-accent-fg tabular-nums">
                    {dueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-surface !text-ink !shadow-card !border-0 !font-sans !rounded-xl",
        }}
      />
    </div>
  );
}
