import { prisma } from '@/lib/prisma'
import ArticleForm from '@/app/admin/new/ArticleForm'
import { createArticle } from '@/app/actions'

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({
    where: { parentId: { not: null } },
    include: { parent: true },
    orderBy: { parentId: 'asc' }
  })

  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    parent: cat.parent ? { name: cat.parent.name } : null
  }))

  return (
    <div className="container mx-auto py-10">
      <ArticleForm categories={formattedCategories} action={createArticle} />
    </div>
  )
}
