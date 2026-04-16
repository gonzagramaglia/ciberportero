import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';

    try {
        const countdowns = await db.countdown.findMany({
            where: { 
                isActive: true,
                postId: null // Only global countdowns
            }
        });

        const filteredCountdowns = countdowns
            .map(c => ({
                id: c.id,
                slot: c.slot,
                title: (c.title as any)[lang]?.trim() || "",
                description: (c.description as any)?.[lang]?.trim() || "",
                expiredMessage: (c.expiredMessage as any)?.[lang]?.trim() || "",
                targetDate: c.targetDate,
                url: c.url,
                isActive: c.isActive
            }))
            .filter(c => c.title !== "");

        return NextResponse.json(filteredCountdowns);
    } catch (error) {
        console.error("Error fetching global countdowns:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
