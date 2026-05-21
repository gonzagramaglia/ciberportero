import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAllPosts, getPostData } from '@/lib/posts';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    const slug = searchParams.get('slug');

    if (slug) {
        try {
            if (db && db.post) {
                const dbPost = await db.post.findFirst({ 
                    where: { 
                        OR: [
                            { slug },
                            { alternativeSlug: slug },
                            { alternativeSlug2: slug }
                        ]
                    },
                    include: { countdowns: true }
                });
                if (dbPost && dbPost.published) {
                    const titleObj = dbPost.title as any;
                    const contentObj = dbPost.content as any;
                    const descObj = dbPost.description as any;

                    return NextResponse.json({
                        id: dbPost.id,
                        slug: dbPost.slug,
                        title: titleObj[lang] || titleObj['es'] || titleObj['en'] || '',
                        content: contentObj[lang] || contentObj['es'] || contentObj['en'] || '',
                        description: descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || '',
                        date: dbPost.date,
                        updatedAt: dbPost.updatedAt,
                        availableLangs: Object.keys(titleObj).filter(l => titleObj[l] && contentObj[l]),
                        countdowns: dbPost.countdowns.map(c => ({
                            slot: c.slot,
                            title: (c.title as any)[lang] || (c.title as any)['es'],
                            description: (c.description as any)?.[lang] || (c.description as any)?.['es'],
                            expiredMessage: (c.expiredMessage as any)?.[lang] || (c.expiredMessage as any)?.['es'],
                            targetDate: c.targetDate,
                            url: c.url,
                            isActive: c.isActive
                        }))
                    });
                }
            }
        } catch (error) {
            console.warn("API Post DB skipped:", error);
        }

        // 2. Fallback to Files
        try {
            const post = getPostData(slug, lang);
            const { getAvailableLangs } = require('@/lib/posts');
            return NextResponse.json({
                ...post,
                availableLangs: getAvailableLangs(slug)
            });
        } catch (error) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
    }

    // --- List all posts ---
    
    // Fetch from DB
    let dbPosts: any[] = [];
    try {
        if (db && db.post) {
            const posts = await db.post.findMany({ 
                where: { published: true }, 
                orderBy: { date: 'desc' } 
            });
            dbPosts = posts
                .filter(p => {
                    const titleObj = p.title as any;
                    const contentObj = p.content as any;
                    // Only show if it has title AND content in the current lang
                    return titleObj[lang] && contentObj[lang];
                })
                .map(p => {
                    const titleObj = p.title as any;
                    const descObj = p.description as any;
                    return {
                        id: p.id,
                        slug: p.slug,
                        title: titleObj[lang],
                        description: descObj?.[lang] || '',
                        date: p.date,
                        availableLangs: Object.keys(titleObj).filter(l => titleObj[l]),
                        alternativeSlug: p.alternativeSlug,
                        alternativeSlug2: p.alternativeSlug2
                    };
                });
        }
    } catch (error) {
        console.warn("API Posts List DB skipped:", error);
    }

    // Fetch from Files
    const filePosts = getAllPosts(lang);
    
    // Merge logic:
    // If ES: Priority to DB posts. Filter out file-based "aprobar-" backups to avoid duplicates in the feed.
    // If EN/PT: DB posts will be empty anyway (filtered by lang above). Only file posts will show.
    const finalFilePosts = lang === 'es' 
        ? filePosts.filter(p => !p.slug.startsWith('aprobar-') && !p.slug.includes('codeforces')) 
        : filePosts;

    const dbSlugs = new Set();
    dbPosts.forEach((p: any) => {
        dbSlugs.add(p.slug);
        if (p.alternativeSlug) dbSlugs.add(p.alternativeSlug);
        if (p.alternativeSlug2) dbSlugs.add(p.alternativeSlug2);
    });

    let mergedPosts = [
        ...dbPosts,
        ...finalFilePosts.filter(p => !dbSlugs.has(p.slug))
    ];

    // Filter out "links" post
    mergedPosts = mergedPosts.filter(p => p.slug !== 'links' && p.title !== 'links');

    // Final sort by date
    mergedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(mergedPosts);
}
