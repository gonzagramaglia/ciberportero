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
            const dbPost = await db.post.findUnique({ where: { slug } });
            if (dbPost && dbPost.published) {
                const titleObj = dbPost.title as any;
                const contentObj = dbPost.content as any;
                const descObj = dbPost.description as any;

                return NextResponse.json({
                    slug: dbPost.slug,
                    title: titleObj[lang] || titleObj['es'] || titleObj['en'] || '',
                    content: contentObj[lang] || contentObj['es'] || contentObj['en'] || '',
                    description: descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || '',
                    date: dbPost.date
                });
            }
        } catch (error) {
            console.error("DB Post fetch error:", error);
        }

        // 2. Fallback to Files
        try {
            const post = getPostData(slug, lang);
            return NextResponse.json(post);
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
        dbPosts = posts.map(p => {
            const titleObj = p.title as any;
            const descObj = p.description as any;
            return {
                slug: p.slug,
                title: titleObj[lang] || titleObj['es'] || titleObj['en'] || '',
                description: descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || '',
                date: p.date
            };
        });
    } catch (error) {
        console.error("DB Posts list error:", error);
    }

    // Fetch from Files
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
