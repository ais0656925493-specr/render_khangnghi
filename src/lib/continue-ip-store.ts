import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { isPrivateOrLocalIp, normalizeIp as normalizeClientIp } from '@/lib/detect-ip-geo';

type ContinueIpStore = {
    ips: Set<string>;
    loaded: boolean;
};

const globalKey = '__continue_clicked_ips__';

const getStore = (): ContinueIpStore => {
    const g = globalThis as typeof globalThis & { [globalKey]?: ContinueIpStore };
    if (!g[globalKey]) {
        g[globalKey] = { ips: new Set<string>(), loaded: false };
    }
    return g[globalKey];
};

const getStorePath = () => {
    const base = process.env.CONTINUE_IP_STORE_DIR || process.env.TMPDIR || '/tmp';
    return join(base, 'meta-protect-continue-ips.json');
};

const normalizeIp = (ip: string) => normalizeClientIp(ip).toLowerCase();

const loadStore = () => {
    const store = getStore();
    if (store.loaded) return store;

    try {
        const filePath = getStorePath();
        if (existsSync(filePath)) {
            const raw = readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(raw) as { ips?: string[] };
            for (const ip of parsed.ips || []) {
                const normalized = normalizeIp(ip);
                if (normalized) store.ips.add(normalized);
            }
        }
    } catch {
        // Ignore unreadable store and continue with memory only.
    }

    store.loaded = true;
    return store;
};

const persistStore = (store: ContinueIpStore) => {
    try {
        const filePath = getStorePath();
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, JSON.stringify({ ips: [...store.ips] }), 'utf8');
    } catch {
        // Ignore persistence failures on read-only runtimes.
    }
};

export const hasContinueNotifyForIp = (ip: string) => {
    const normalized = normalizeIp(ip);
    if (!normalized || normalized === 'unknown' || isPrivateOrLocalIp(normalized)) return false;
    return loadStore().ips.has(normalized);
};

export const markContinueNotifyForIp = (ip: string) => {
    const normalized = normalizeIp(ip);
    if (!normalized || normalized === 'unknown' || isPrivateOrLocalIp(normalized)) return;
    const store = loadStore();
    if (store.ips.has(normalized)) return;
    store.ips.add(normalized);
    persistStore(store);
};
