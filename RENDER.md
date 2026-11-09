# Deploy lên Render

App Next.js (SSR + API) → dùng **Web Service**, không dùng Static Site.

## Cách nhanh: Blueprint

1. Đẩy repo lên GitHub/GitLab.
2. Vào [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Chọn repo. File `render.yaml` sẽ tạo service `meta-protect` (Singapore, Node 22, pnpm).

## Cách thủ công: Web Service

- **Runtime:** Node
- **Build Command:** `corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile && pnpm build`
- **Start Command:** `pnpm exec next start --hostname 0.0.0.0 --port $PORT`
- **Instance:** Free (hoặc Starter)
- **Region:** Singapore

## Biến môi trường

Upload file `.env` trên Render Dashboard (Environment). Ưu tiên:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Nếu Render không nhận được 2 biến này, app dùng giá trị trong file `.env` gốc của project.

Sau khi live, URL dạng `https://meta-protect.onrender.com`.
