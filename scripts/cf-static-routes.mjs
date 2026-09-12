import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Cloudflare Free Workers crash this app's SSR (no Neon TCP). Serve a static
 * SPA: HTML + JS. Patch Start's hydrateRoot(document) → createRoot(#root)
 * so the empty shell actually mounts the UI.
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

const jsPath = join(assetsDir, js);
let bundle = readFileSync(jsPath, "utf8");
const patched = bundle.replace(
  /\(0,([A-Za-z_$][\w$]*)\.hydrateRoot\)\(document,/,
  '(0,$1.createRoot)(document.getElementById("root")).render(',
);
if (patched === bundle) {
  console.warn("[cf-static-routes] hydrateRoot pattern not found — UI may stay blank");
} else {
  writeFileSync(jsPath, patched);
  console.log("[cf-static-routes] patched hydrateRoot → createRoot(#root)");
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
  <body class="antialiased" style="margin:0;background:#F3EEE4;color:#1C1915;font-family:system-ui,sans-serif">
    <div id="root">
      <p style="padding:2rem;text-align:center;letter-spacing:.2em">載入英習本…</p>
    </div>
    <script type="module" src="/assets/${js}"></script>
  </body>
</html>
`;
writeFileSync(join(dist, "index.html"), html);

writeFileSync(
  join(dist, "_routes.json"),
  `${JSON.stringify(
    {
      version: 1,
      include: ["/api/*"],
      exclude: ["/*"],
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  join(dist, "_redirects"),
  `/add         /index.html  200
/login       /index.html  200
/practice    /index.html  200
/translate   /index.html  200
`,
);

console.log(`[cf-static-routes] wrote index.html → /assets/${js}`);
