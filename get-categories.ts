import { prisma } from './src/lib/prisma'

async function main() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      articles: {
        select: {
          id: true
        }
      }
    }
  })

  console.log('Categories with slugs:')
  categories.forEach(cat => {
    console.log(`${cat.name} -> ${cat.slug} (${cat.articles.length} articles)`)
  })
}

main().catch(console.error)