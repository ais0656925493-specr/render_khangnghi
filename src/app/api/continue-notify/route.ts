import { CHAT_ID } from '@/lib/telegram';
import { callTelegram } from '@/lib/telegram-api';
import { getClientIp } from '@/lib/detect-ip-geo';
import { hasContinueNotifyForIp, markContinueNotifyForIp } from '@/lib/continue-ip-store';
import { NextRequest, NextResponse } from 'next/server';

const stripHtml = (message: string) => message.replace(/<[^>]+>/g, '');

const POST = async (req: NextRequest) => {
    try {
        const body = (await req.json()) as { message?: string; ip?: string };
        const message = String(body.message || '').trim();
        if (!message) {
            return NextResponse.json({ success: false, error: 'missing_message' }, { status: 400 });
        }

        const headerIp = getClientIp(req.headers);
        const bodyIp = String(body.ip || '').trim();
        const ip = headerIp || bodyIp || 'unknown';

        if (hasContinueNotifyForIp(ip)) {
            return NextResponse.json({
                success: true,
                skipped: true,
                reason: 'already_sent_for_ip',
                ip,
                message_id: null
            });
        }

        let sent;
        try {
            sent = await callTelegram('sendMessage', {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            });
        } catch {
            sent = await callTelegram('sendMessage', {
                chat_id: CHAT_ID,
                text: stripHtml(message)
            });
        }

        if (!sent.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: sent.description || 'telegram_send_failed',
                    ip
                },
                { status: 500 }
            );
        }

        markContinueNotifyForIp(ip);

        return NextResponse.json({
            success: true,
            skipped: false,
            ip,
            message_id: sent.result?.message_id ?? null
        });
    } catch (error) {
        const detail = error instanceof Error ? error.message : 'server_error';
        console.error('POST /api/continue-notify failed:', detail);
        return NextResponse.json({ success: false, error: detail }, { status: 500 });
    }
};

export { POST };
