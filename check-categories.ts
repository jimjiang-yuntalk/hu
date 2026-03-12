import { prisma } from './src/lib/prisma'

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { order: "asc" },
    })
    
    console.log('Parent categories:', categories.length)
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.children.length} children`)
      if (cat.children.length === 0) {
        console.log('  -> NO CHILDREN!')
      }
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()