import type { NextConfig } from 'next';

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
