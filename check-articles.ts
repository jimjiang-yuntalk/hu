import { prisma } from './src/lib/prisma';

async function main() {
  const articleCount = await prisma.article.count();
  const categoryCount = await prisma.category.count();
  const qaCount = await prisma.qaHistory.count();
  
  console.log(`Articles: ${articleCount}`);
  console.log(`Categories: ${categoryCount}`);
  console.log(`QA History: ${qaCount}`);
  
  // Check if we have the expected data
  if (articleCount < 50) {
    console.log('Article count is low, need to restore from markdown files');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);