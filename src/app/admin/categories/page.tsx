import { prisma } from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CategorySheet } from './CategorySheet'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [
      { parentId: 'asc' }, // Groups roots first
      { order: 'asc' }
    ],
    include: {
      parent: true,
      _count: {
        select: { articles: true }
      }
    }
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">分类管理 (Categories)</h1>
        <CategorySheet categories={categories} />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称 (Name)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>层级 (Level)</TableHead>
              <TableHead>关键词 (Keywords)</TableHead>
              <TableHead>文章数 (Articles)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {category.parentId && <span className="text-muted-foreground">↳</span>}
                    {category.name}
                  </div>
                </TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  {category.parentId ? (
                    <Badge variant="outline">二级 (Sub)</Badge>
                  ) : (
                    <Badge>一级 (Root)</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {category.keywords || '-'}
                </TableCell>
                <TableCell>{category._count.articles}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
