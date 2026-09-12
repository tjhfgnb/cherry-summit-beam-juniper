import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const assetsDir = join(dist, "assets");
if (!existsSync(assetsDir)) process.exit(0);

const files = readdirSync(assetsDir);
const css = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
const js = existsSync(join(assetsDir, "spa.js")) ? "spa.js" : undefined;

if (!css || !js) {
  console.error("[cf-static-routes] need styles-*.css and assets/spa.js");
  process.exit(1);
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
      <p style="padding:2rem;text-align:center">載入英習本…</p>
    </div>
    <script>
      window.addEventListener("error", function (e) {
        var r = document.getElementById("root");
        if (r && e.message) r.textContent = "載入失敗：" + e.message;
      });
    </script>
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

console.log(`[cf-static-routes] index.html → /assets/${js}`);
