import { prisma } from '@/lib/prisma'
import ImportForm from './ImportForm'
import { Upload } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SmartImportPage() {
  // Fetch initial data for the form
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true
    },
    orderBy: { order: 'asc' }
  })

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Upload className="h-8 w-8" />
        智能导入助手 (Smart Import)
      </h1>
      
      <ImportForm categories={categories} articles={articles} />
    </div>
  )
}
