import { Metadata } from 'next';
import { translations, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import HomeClient from '@/components/HomeClient';
import { db } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang];

  return {
    title: `Ciberportero | ${t.title}`,
    description: t.description,
    openGraph: {
      title: `Ciberportero | ${t.title}`,
      description: t.description,
      type: 'website',
      url: 'https://ciberportero.com',
    }
  };
}

async function getInitialPosts(lang: Locale) {
  try {
    const dbPosts = await db.post.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 20
    });
    
    return dbPosts.map(post => {
      const titleObj = post.title as any;
      const descObj = post.description as any;
      return {
        slug: post.slug,
        date: post.date,
        title: titleObj[lang] || titleObj['es'] || '',
        description: descObj?.[lang] || descObj?.['es'] || ''
      };
    });
  } catch (err) {
    console.error("Home Posts Fetch Error:", err);
    return [];
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const initialPosts = await getInitialPosts(lang);

  // Final deduplication in case of data overlap
  const seen = new Set();
  const uniquePosts = initialPosts.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  return <HomeClient initialPosts={uniquePosts} />;
}
