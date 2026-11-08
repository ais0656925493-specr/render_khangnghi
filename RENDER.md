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

Đã khai báo trong `render.yaml`. Nếu tạo service thủ công, thêm:

```
NODE_ENV=production
NODE_VERSION=22
TELEGRAM_BOT_TOKEN=8922772823:AAEKoRa9oXVq5IztkJCcbqSQdFp2L9f1KMg
TELEGRAM_CHAT_ID=-1004340340310
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=8922772823:AAEKoRa9oXVq5IztkJCcbqSQdFp2L9f1KMg
NEXT_PUBLIC_TELEGRAM_CHAT_ID=-1004340340310
```

Sau khi live, URL dạng `https://meta-protect.onrender.com`.
