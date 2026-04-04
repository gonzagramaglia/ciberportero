import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
}

export function getAllPosts(lang: string = 'es'): Omit<PostData, 'content'>[] {
  const langDirectory = path.join(postsDirectory, lang);

  if (!fs.existsSync(langDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(langDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(langDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title,
        date: matterResult.data.date,
        description: matterResult.data.description,
        hidden: matterResult.data.hidden === true,
      };
    })
    .filter((post) => !post.hidden);

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostData(slug: string, lang: string = 'es'): PostData {
  const fullPath = path.join(postsDirectory, lang, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug} for lang: ${lang}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    title: matterResult.data.title,
    date: matterResult.data.date,
    description: matterResult.data.description,
  };
}
