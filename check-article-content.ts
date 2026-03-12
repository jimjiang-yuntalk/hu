import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const articles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`Found ${articles.length} articles`)
  articles.forEach((article, index) => {
    console.log(`\n--- Article ${index + 1} ---`)
    console.log(`Title: ${article.title}`)
    console.log(`Content preview: ${article.content.substring(0, 200)}...`)
    console.log(`Content length: ${article.content.length}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })