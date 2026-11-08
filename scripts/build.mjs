import { execSync } from 'child_process';

execSync('next build', { stdio: 'inherit' });

// Chỉ đóng gói Cloudflare khi bật tường minh — tránh Render/Netlify (CI=true) chạy nhầm.
const packageForCloudflare =
    process.env.PACKAGE_FOR_CLOUDFLARE === '1' && process.env.OPENNEXT_BUILD !== '1';

if (packageForCloudflare) {
    execSync('opennextjs-cloudflare build', {
        stdio: 'inherit',
        env: { ...process.env, OPENNEXT_BUILD: '1' },
    });
}
