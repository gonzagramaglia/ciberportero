import { Metadata } from 'next';
import { db } from '@/lib/db';
import { getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import PostClient from '@/components/PostClient';
import { Locale } from '@/lib/translations';
import { cookies } from 'next/headers';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  // 1. Try DB
  try {
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
    if (dbPost && dbPost.published) return dbPost;
  } catch (err) {
    console.error("DB Fetch Error:", err);
  }

  // 2. Fallback to Files
  try {
    const filePost = getPostData(slug, 'es'); // Default to ES for search
    if (filePost) return { ...filePost, id: null };
  } catch (err) {}

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  
  const post = await getPost(slug);
  if (!post) return { title: 'Post no encontrado | Ciberportero' };

  const titleObj = post.title as any;
  const descObj = post.description as any;
  const title = titleObj[lang] || titleObj['es'] || titleObj['en'] || 'Post';
  const description = descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || '';

  return {
    title: `Ciberportero | ${title}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ciberportero.com/${slug}`,
    }
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return <PostClient post={post} slug={slug} />;
}
