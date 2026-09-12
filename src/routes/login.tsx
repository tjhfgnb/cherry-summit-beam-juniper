import { useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { isLocalAuthOnly, localSignIn, localSignUp } from "@/lib/auth/local-account";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const localOnly = isLocalAuthOnly();

  if (isPending) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface" />;
  }
  if (user) return <Navigate to="/" />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const trimmedEmail = email.trim();
    try {
      if (localOnly) {
        if (mode === "signup") {
          await localSignUp({
            email: trimmedEmail,
            password,
            name: name.trim() || trimmedEmail,
          });
        } else {
          await localSignIn({ email: trimmedEmail, password });
        }
        window.location.assign("/");
        return;
      }
      if (mode === "signup") {
        const { error: err } = await authClient.signUp.email({
          email: trimmedEmail,
          password,
          name: name.trim() || trimmedEmail,
        });
        if (err) throw new Error(err.message ?? "無法建立帳號");
      } else {
        const { error: err } = await authClient.signIn.email({
          email: trimmedEmail,
          password,
        });
        if (err) throw new Error(err.message ?? "登入失敗");
      }
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "請再試一次");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-widest text-faint">Account</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {mode === "signup" ? "建立帳號" : "登入"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {localOnly
            ? "帳號存在這台手機／電腦的瀏覽器裡，單字本會跟著帳號分開保存。清掉網站資料或換裝置就要重新建立。"
            : "登入後單字本、熟練度與連續天數會跟著帳號走。未登入仍可在這台裝置練習。"}
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 rounded-xl bg-surface p-1 shadow-card">
        <button
          type="button"
          className={cn(
            "h-9 rounded-lg text-sm font-medium",
            mode === "signin" ? "bg-accent text-accent-fg" : "text-ink-soft",
          )}
          onClick={() => setMode("signin")}
        >
          登入
        </button>
        <button
          type="button"
          className={cn(
            "h-9 rounded-lg text-sm font-medium",
            mode === "signup" ? "bg-accent text-accent-fg" : "text-ink-soft",
          )}
          onClick={() => setMode("signup")}
        >
          建立帳號
        </button>
      </div>

      {authEnabled ? (
        <form className="space-y-3 rounded-xl bg-surface p-4 shadow-card" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink-soft">
                稱呼
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                autoComplete="name"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink-soft">
              電子郵件
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink-soft">
              密碼
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            {mode === "signup" ? (
              <p className="mt-1 text-xs text-faint">至少 8 個字</p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "請稍候…" : mode === "signup" ? "建立並登入" : "登入"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted">目前未開放登入。</p>
      )}

      {authEnabled && !localOnly && GROK_PROVIDERS.length > 0 ? (
        <div className="mt-5 space-y-2">
          <p className="text-center text-xs uppercase tracking-widest text-faint">或用社群帳號</p>
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
            >
              使用 {p.label} 繼續
            </Button>
          ))}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/" className="text-accent underline-offset-2 hover:underline">
          先不登入，繼續練習
        </Link>
      </p>
    </div>
  );
}
