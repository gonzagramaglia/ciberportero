import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAllPosts, getPostData } from '@/lib/posts';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    const slug = searchParams.get('slug');

    if (slug) {
        // 1. Try Database first
        try {
            const dbPost = await db.post.findFirst({ 
                where: { 
                    OR: [
                        { slug },
                        { alternativeSlug: slug }
                    ]
                } 
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
                    availableLangs: Object.keys(titleObj).filter(l => titleObj[l] && contentObj[l])
                });
            }
        } catch (error) {
            console.error("DB Post fetch error:", error);
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
                    availableLangs: Object.keys(titleObj).filter(l => titleObj[l])
                };
            });
    } catch (error) {
        console.error("DB Posts list error:", error);
    }

    // Fetch from Files (already filtered by getAllPosts(lang))
    const filePosts = getAllPosts(lang);
    
    // Merge (Database takes priority if slug matches)
    const dbSlugs = new Set(dbPosts.map(p => p.slug));
    const mergedPosts = [
        ...dbPosts,
        ...filePosts.filter(p => !dbSlugs.has(p.slug))
    ];

    // Final sort by date
    mergedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(mergedPosts);
}
