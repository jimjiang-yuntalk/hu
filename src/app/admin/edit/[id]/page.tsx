import { prisma } from '@/lib/prisma'
import ArticleForm from '@/app/admin/new/ArticleForm'
import { updateArticle } from '@/app/actions'
import { notFound } from 'next/navigation'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      categories: true,
      tags: true
    }
  })

  if (!article) {
    notFound()
  }

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

  const updateArticleWithId = updateArticle.bind(null, id)

  return (
    <div className="container mx-auto py-10">
      <ArticleForm 
        categories={formattedCategories} 
        initialData={article} 
        action={updateArticleWithId} 
      />
    </div>
  )
}
