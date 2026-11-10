import fs from 'fs';
import path from 'path';
import type { NextConfig } from 'next';

const copyAuthenticationImage = () => {
    const src = path.join(process.cwd(), 'public', 'static', 'media', 'authentication.png');
    if (!fs.existsSync(src)) return;

    const dests = [
        path.join(process.cwd(), '.next', 'dev', 'static', 'media', 'authentication.png'),
        path.join(process.cwd(), '.next', 'static', 'media', 'authentication.png')
    ];

    for (const dest of dests) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
};

copyAuthenticationImage();

const nextConfig: NextConfig = {
    reactCompiler: false,
    poweredByHeader: false,
    images: {
        unoptimized: true
    }
};

async function loadConfig() {
    // Chỉ bật OpenNext Cloudflare khi dev local — không ảnh hưởng Render.
    if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
        try {
            const { initOpenNextCloudflareForDev } = await import('@opennextjs/cloudflare');
            initOpenNextCloudflareForDev();
        } catch {
            // Bỏ qua nếu không dùng Cloudflare.
        }
    }

    return nextConfig;
}

export default loadConfig;
