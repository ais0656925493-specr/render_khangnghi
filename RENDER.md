# Deploy lên Render

## Cấu hình Web Service

- **Runtime:** Node
- **Build Command:** `corepack enable && pnpm install --frozen-lockfile && pnpm build`
- **Start Command:** `pnpm start`
- **Instance:** Free (hoặc Starter)

## Biến môi trường (Environment)

Thêm trong Render Dashboard → Environment:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
NODE_VERSION=22
NODE_ENV=production
```

File `render.yaml` đã có sẵn Blueprint; có thể dùng **New → Blueprint** và chọn repo.

## Lưu ý

- App Next.js chạy SSR + API routes → dùng **Web Service**, không phải Static Site.
- `pnpm start` = `next start` (bind PORT do Render cung cấp).
