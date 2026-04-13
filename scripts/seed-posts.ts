import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const prisma = new PrismaClient();

async function main() {
  const postsDir = path.join(process.cwd(), 'posts');
  const esDir = path.join(postsDir, 'es');
  const enDir = path.join(postsDir, 'en');
  const ptDir = path.join(postsDir, 'pt');

  // 1. Clear existing posts
  console.log('🗑️ Cleaning existing posts from database...');
  await prisma.post.deleteMany({});

  // 2. Get all ES files as base
  const files = fs.readdirSync(esDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const slug = file.replace('.md', '');
    console.log(`📦 Processing post: ${slug}...`);

    const esContent = fs.readFileSync(path.join(esDir, file), 'utf-8');
    const esParsed = matter(esContent);

    // Try to get EN and PT
    let enParsed = { data: {} as any, content: '' };
    const enPath = path.join(enDir, file);
    if (fs.existsSync(enPath)) {
      enParsed = matter(fs.readFileSync(enPath, 'utf-8'));
    }

    let ptParsed = { data: {} as any, content: '' };
    const ptPath = path.join(ptDir, file);
    if (fs.existsSync(ptPath)) {
      ptParsed = matter(fs.readFileSync(ptPath, 'utf-8'));
    }

    // Construct multilingual objects
    const title = {
      es: esParsed.data.title || slug,
      en: enParsed.data.title || esParsed.data.title || slug,
      pt: ptParsed.data.title || esParsed.data.title || slug
    };

    const description = {
      es: esParsed.data.description || '',
      en: enParsed.data.description || esParsed.data.description || '',
      pt: ptParsed.data.description || esParsed.data.description || ''
    };

    const content = {
      es: esParsed.content,
      en: enParsed.content || esParsed.content,
      pt: ptParsed.content || esParsed.content
    };

    const date = esParsed.data.date ? new Date(esParsed.data.date) : new Date();

    await prisma.post.create({
      data: {
        slug,
        title: title as any,
        content: content as any,
        description: description as any,
        published: true,
        date
      }
    });
  }

  console.log('✅ All posts migrated successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
