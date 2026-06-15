import { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import PostClient from '@/components/PostClient';
import { Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import { auth } from '@/auth';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getUnlistedPost(slug: string) {
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
      // Allow if it is published and unlisted
      if (dbPost && dbPost.published && dbPost.unlisted) return dbPost;
    }
  } catch (err) {
    console.warn("Individual Blog Post DB Fetch skipped:", err);
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  
  const post = await getUnlistedPost(slug);
  if (!post) return { title: 'Post no encontrado' };

  const titleObj = post.title as any;
  const descObj = post.description as any;
  const title = titleObj[lang] || titleObj['es'] || titleObj['en'] || 'Post';
  const description = descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || '';

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ciberportero.com/blog/${slug}`,
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

export default async function BlogPostPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;
  const post = await getUnlistedPost(slug);

  if (!post) notFound();

  // We reuse PostClient, but maybe the base slug needs to be known?
  // Actually, PostClient uses window.location or slug for some things.
  // We can just pass the slug.
  return <PostClient post={post} slug={slug} session={session} />;
}
