'use client';

import { useEffect } from 'react';
import { guestStore } from '@/lib/guestStore';
import { useRouter } from 'next/navigation';

export default function RoomTitleUpdater({ roomId, fallbackTitle }: { roomId: string, fallbackTitle: string }) {
    const router = useRouter();

    useEffect(() => {
        const room = guestStore.getRoom(roomId);
        if (room) {
            document.title = `Ciberportero | ${room.name}`;
        } else {
            document.title = fallbackTitle;
        }
    }, [roomId, fallbackTitle, router]);

    return null;
}
