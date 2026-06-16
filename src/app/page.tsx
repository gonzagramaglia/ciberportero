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
    // Robust check for db client to prevent initialization crashes from taking down the page
    if (db && db.post) {
      const posts = await db.post.findMany({
        where: { published: true, unlisted: false },
        orderBy: { date: 'desc' }
      });
      
      if (posts && Array.isArray(posts)) {
        dbPosts = posts
          .filter(p => {
            const titleObj = p.title as any;
            const contentObj = p.content as any;
            return titleObj && contentObj && titleObj[lang] && contentObj[lang];
          })
          .map(p => {
            const titleObj = p.title as any;
            const descObj = p.description as any;
            return {
              slug: p.slug,
              date: p.date,
              title: titleObj[lang] || titleObj['es'] || '',
              description: descObj?.[lang] || descObj?.['es'] || '',
              updatedAt: p.updatedAt,
              alternativeSlug: p.alternativeSlug,
              alternativeSlug2: p.alternativeSlug2
            };
          });
      }
    }
  } catch (err) {
    console.warn("Home DB Posts skipped (expected if DB not ready):", err);
  }

  dbPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return dbPosts.slice(0, 20);
}

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const initialPosts = await getInitialPosts(lang);

  return <HomeClient initialPosts={initialPosts} />;
}
