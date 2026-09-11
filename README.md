# 英習本 Wordbook

自己的英文單字本：單字本、速加、翻譯、閃卡／選擇／拼寫練習。

## 部署到 Cloudflare Pages

請接到這個 GitHub 倉庫，並用下面設定（不要用預設的 `npm run build`，那是給 Vercel 的）。

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 選倉庫 `tjhfgnb/cherry-summit-beam-juniper`，分支 `main`
3. 建置設定：

| 欄位 | 值 |
|---|---|
| Framework preset | None |
| Build command | `npm run build:cf` |
| Build output directory | `dist` |
| Node.js version | `22` |

4. **Settings → Functions → Compatibility flags** 加上 `nodejs_compat`（`wrangler.jsonc` 裡已寫，多數情況會自動帶上）
5. 儲存後 **Retry deployment**

建置成功後，底部導覽會有 **單字本 / 速加 / 翻譯 / 練習**。速加頁路徑是 `/add`。

本機預覽 Cloudflare 輸出：

```bash
npm run build:cf
npx wrangler pages dev dist
```
