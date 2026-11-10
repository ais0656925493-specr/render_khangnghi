import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

execSync('next build', { stdio: 'inherit' });

const authenticationSrc = path.join('public', 'static', 'media', 'authentication.png');
if (fs.existsSync(authenticationSrc)) {
    for (const destDir of [
        path.join('.next', 'static', 'media'),
        path.join('.next', 'dev', 'static', 'media')
    ]) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(authenticationSrc, path.join(destDir, 'authentication.png'));
    }
}

// Chỉ đóng gói Cloudflare khi bật tường minh — tránh Render/Netlify (CI=true) chạy nhầm.
const packageForCloudflare =
    process.env.PACKAGE_FOR_CLOUDFLARE === '1' && process.env.OPENNEXT_BUILD !== '1';

if (packageForCloudflare) {
    execSync('opennextjs-cloudflare build', {
        stdio: 'inherit',
        env: { ...process.env, OPENNEXT_BUILD: '1' },
    });
}
