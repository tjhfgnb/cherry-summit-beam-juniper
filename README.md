# 英習本 Wordbook

自己的英文單字本：單字本、速加、翻譯、閃卡／選擇／拼寫練習。可建立帳號，把單字與練習紀錄存在雲端。

## 部署到 Cloudflare Pages

可以。練習、速加、翻譯不需資料庫，單字會存在瀏覽器。  
**登入並把紀錄存到雲端**則需要一個 Postgres（建議 Neon 免費方案），Cloudflare 不會自動提供。

### 1. 建置設定

Workers & Pages → Create → Pages → Connect to Git  
倉庫：`tjhfgnb/cherry-summit-beam-juniper`，分支 `main`

| 欄位 | 值 |
|---|---|
| Framework preset | None |
| Build command | `npm run build:cf` |
| Build output directory | `dist` |
| Node.js version | `22` |

Compatibility flags 加 `nodejs_compat`（`wrangler.jsonc` 已寫）。

### 2. 若要帳號保存（建議）

1. 到 [Neon](https://neon.tech) 開一個免費資料庫，複製連線字串（Connection string）
2. Cloudflare Pages → Settings → Environment variables，**Production** 加上：

| 變數 | 值 |
|---|---|
| `DATABASE_URL` | Neon 連線字串 |
| `BETTER_AUTH_SECRET` | 一組夠長的隨機字串（至少 32 字） |
| `BETTER_AUTH_URL` | 你的網站網址，例如 `https://yingxiben.pages.dev`（不要結尾斜線） |

3. 重新部署一次。之後用**電子郵件**建立帳號即可。  
   Google / X 登入是給 Grok 發布用的，Cloudflare 上請改用信箱。

沒填 `DATABASE_URL` 也能用網站，只是登入無法長期保存（換裝置會不見）。

### 本機預覽 Cloudflare 輸出

```bash
npm run build:cf
npx wrangler pages dev dist
```
