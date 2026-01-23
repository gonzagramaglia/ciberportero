import { NextResponse } from 'next/server';
import { getAllPosts, getPostData } from '@/lib/posts';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    const slug = searchParams.get('slug');

    if (slug) {
        try {
            const post = getPostData(slug, lang);
            return NextResponse.json(post);
        } catch (error) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
    }

    const posts = getAllPosts(lang);
    return NextResponse.json(posts);
}
