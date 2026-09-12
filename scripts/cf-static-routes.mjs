import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Cloudflare Free Workers have a 10ms CPU budget. Serving the wordbook as a
 * static SPA avoids running the SSR worker on every page view.
 */
const dist = "dist";
const assetsDir = join(dist, "assets");
if (!existsSync(assetsDir)) process.exit(0);

const files = readdirSync(assetsDir);
const css = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
const jsCandidates = files.filter((f) => f.startsWith("index-") && f.endsWith(".js"));
jsCandidates.sort((a, b) => statSync(join(assetsDir, b)).size - statSync(join(assetsDir, a)).size);
const js = jsCandidates[0];
if (!css || !js) {
  console.warn("[cf-static-routes] missing hashed assets, skip");
  process.exit(0);
}

const html = `<!DOCTYPE html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>英習本 Wordbook</title>
    <meta name="description" content="自己的英文單字本：新增、翻譯、閃卡與拼寫練習。" />
    <meta name="theme-color" content="#F3EEE4" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/assets/${css}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" />
  </head>
  <body>
    <script type="module" src="/assets/${js}"></script>
  </body>
</html>
`;

writeFileSync(join(dist, "index.html"), html);

const routesPath = join(dist, "_routes.json");
if (existsSync(routesPath)) {
  const routes = JSON.parse(readFileSync(routesPath, "utf8"));
  const exclude = new Set(routes.exclude ?? []);
  for (const extra of ["/", "/index.html", "/add", "/login", "/practice", "/translate"]) {
    exclude.add(extra);
  }
  routes.exclude = [...exclude];
  writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
}

const redirectsPath = join(dist, "_redirects");
const spaRedirects = `/add /index.html 200
/login /index.html 200
/practice /index.html 200
/translate /index.html 200
`;
const existing = existsSync(redirectsPath) ? readFileSync(redirectsPath, "utf8") : "";
if (!existing.includes("/index.html 200")) {
  writeFileSync(redirectsPath, `${existing.trim()}\n${spaRedirects}`.trim() + "\n");
}

console.log(`[cf-static-routes] wrote index.html -> /assets/${js}`);
