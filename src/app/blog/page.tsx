import { Metadata } from 'next';
import { translations, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import BlogClient from '@/components/BlogClient';
import { db } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang];

  return {
    title: "Blog",
    description: lang === 'es' ? 'Artículos, glosarios y notas sobre ciberseguridad, programación y más.' : 'Articles, glossaries, and notes on cybersecurity, programming, and more.',
  };
}

async function getInitialUnlistedPosts(lang: Locale) {
  let dbPosts: any[] = [];
  try {
    if (db && db.post) {
      const posts = await db.post.findMany({
        where: { published: true, unlisted: true },
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
              alternativeSlug: p.alternativeSlug,
              alternativeSlug2: p.alternativeSlug2
            };
          });
      }
    }
  } catch (err) {
    console.warn("Blog DB Posts skipped:", err);
  }

  return dbPosts;
}

export default async function BlogPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const initialPosts = await getInitialUnlistedPosts(lang);

  return <BlogClient initialPosts={initialPosts} />;
}
