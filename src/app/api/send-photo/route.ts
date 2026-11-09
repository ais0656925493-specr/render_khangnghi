import { getTelegramConfig } from '@/lib/telegram';
import { callTelegramForm } from '@/lib/telegram-api';
import { NextRequest, NextResponse } from 'next/server';

const POST = async (req: NextRequest) => {
    try {
        const incoming = await req.formData();
        const photo = incoming.get('photo');
        const caption = String(incoming.get('caption') || '');

        if (!(photo instanceof File)) {
            return NextResponse.json({ success: false, error: 'missing_photo' }, { status: 400 });
        }

        const { chatId } = getTelegramConfig();
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', photo, photo.name || 'upload.jpg');

        if (caption) {
            form.append('caption', caption);
            form.append('parse_mode', 'HTML');
        }

        const sent = await callTelegramForm('sendPhoto', form);
        if (!sent.ok) {
            return NextResponse.json(
                { success: false, error: sent.description || 'telegram_send_photo_failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message_id: sent.result?.message_id ?? null
        });
    } catch (error) {
        const detail = error instanceof Error ? error.message : 'server_error';
        console.error('POST /api/send-photo failed:', detail);
        return NextResponse.json({ success: false, error: detail }, { status: 500 });
    }
};

export { POST };
