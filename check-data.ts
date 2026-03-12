import { prisma } from './src/lib/prisma';

async function checkData() {
  try {
    const articleCount = await prisma.article.count();
    const categoryCount = await prisma.category.count();
    const tagCount = await prisma.tag.count();
    
    console.log('Article count:', articleCount);
    console.log('Category count:', categoryCount);
    console.log('Tag count:', tagCount);
    
    // Check if articles have categories
    const articlesWithCategories = await prisma.article.findMany({
      take: 5,
      include: {
        categories: true
      }
    });
    
    console.log('Sample articles with categories:');
    articlesWithCategories.forEach(article => {
      console.log(`- ${article.title}: ${article.categories.length} categories`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();