import { Metadata } from 'next';
import { translations, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import HomeClient from '@/components/HomeClient';
import { db } from '@/lib/db';
import { getAllPosts } from '@/lib/posts';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang];

  return {
    title: "Ciberportero",
    description: t.description,
    openGraph: {
      title: "Ciberportero",
      description: t.description,
      type: 'website',
      url: 'https://ciberportero.com',
    }
  };
}

async function getInitialPosts(lang: Locale) {
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
        return titleObj[lang] && contentObj[lang];
      })
      .map(p => {
        const titleObj = p.title as any;
        const descObj = p.description as any;
        return {
          slug: p.slug,
          date: p.date,
          title: titleObj[lang] || titleObj['es'] || '',
          description: descObj?.[lang] || descObj?.['es'] || '',
          alternativeSlug: p.alternativeSlug,
          alternativeSlug2: p.alternativeSlug2
        };
      });
  } catch (err) {
    console.error("Home DB Posts Fetch Error:", err);
  }

  const filePosts = getAllPosts(lang);
  const dbSlugs = new Set();
  dbPosts.forEach(p => {
    dbSlugs.add(p.slug);
    if (p.alternativeSlug) dbSlugs.add(p.alternativeSlug);
    if (p.alternativeSlug2) dbSlugs.add(p.alternativeSlug2);
  });

  const merged = [...dbPosts, ...filePosts.filter(p => !dbSlugs.has(p.slug))];
  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return merged.slice(0, 20);
}

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const initialPosts = await getInitialPosts(lang);

  return <HomeClient initialPosts={initialPosts} />;
}
