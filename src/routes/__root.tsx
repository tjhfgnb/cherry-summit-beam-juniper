import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/app-shell";
import appCss from "../styles.css?url";

const APP_NAME = "英習本 Wordbook";

function RootShell({ children }: { children: ReactNode }) {
  // Cloudflare static shell mounts into #root — do not wrap a second <html>.
  if (typeof document !== "undefined" && document.getElementById("root")) {
    return <>{children}</>;
  }
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootApp() {
  return (
    <>
      <PreviewHostBridge />
      <AuthProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </AuthProvider>
    </>
  );
}

export const Route = createRootRoute({
  shellComponent: RootShell,
  component: RootApp,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "自己的英文單字本：新增、翻譯、閃卡與拼寫練習。",
      },
      { name: "theme-color", content: "#F3EEE4" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap",
      },
    ],
  }),
});
