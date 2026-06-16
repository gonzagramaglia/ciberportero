import { Metadata } from 'next';
import { db } from '@/lib/db';
import { getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import PostClient from '@/components/PostClient';
import { Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import { auth } from '@/auth';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string, session?: any) {
  // 1. Try DB
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
        include: { 
          countdowns: true,
          votes: true 
        }
      });
      if (dbPost && dbPost.published) {
        if (!dbPost.unlisted) return dbPost;
      }
    }
  } catch (err) {
    console.warn("Individual Post DB Fetch skipped:", err);
  }

  // 2. Fallback to Files
  try {
    const filePost = getPostData(slug, 'es'); // Default to ES for search
    if (filePost) return { ...filePost, id: null, votes: [] };
  } catch (err) {}

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  
  const session = await auth();
  const post = await getPost(slug, session);
  if (!post) return { title: 'Post no encontrado' };

  const titleObj = post.title as any;
  const descObj = post.description as any;
  const title = titleObj[lang] || titleObj['es'] || titleObj['en'] || 'Post';
  const description = descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || '';

  return {
    title: slug === 'links' ? `Ciberportero | ${title}` : { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ciberportero.com/${slug}`,
      images: [
        {
          url: '/vercel-logo.png',
          width: 1200,
          height: 630,
          alt: title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/vercel-logo.png'],
    }
  };
}

export default async function PostPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;
  const post = await getPost(slug, session);

  if (!post) notFound();

  return <PostClient post={post} slug={slug} session={session} />;
}
