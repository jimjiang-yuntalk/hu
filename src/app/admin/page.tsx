import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Pencil, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import DeleteButton from "./DeleteButton"
import { Difficulty } from '@prisma/client'

export const dynamic = 'force-dynamic'

type SortField = 'title' | 'category' | 'difficulty' | 'createdAt'
type SortOrder = 'asc' | 'desc'

interface AdminPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams
  const sort = (params.sort as SortField) || 'createdAt'
  const order = (params.order as SortOrder) || 'desc'

  const articles = await prisma.article.findMany({
    include: { categories: true },
    // We'll sort in memory for better Chinese support and custom logic
  })

  // Sorting Logic
  const sortedArticles = [...articles].sort((a, b) => {
    const modifier = order === 'asc' ? 1 : -1
    const collator = new Intl.Collator('zh-CN', { numeric: true })
    
    // Use first category for sorting
    const catA = a.categories[0]?.name || ''
    const catB = b.categories[0]?.name || ''

    switch (sort) {
      case 'title':
        return modifier * collator.compare(a.title, b.title)
      case 'category':
        // Sort by category name (pinyin)
        return modifier * collator.compare(catA, catB)
      case 'difficulty':
        // Custom difficulty order
        const difficultyOrder: Record<string, number> = {
          'L1_Beginner': 1,
          'L2_Amateur': 2,
          'L3_Advanced': 3,
          'L4_Pro': 4
        }
        const diffA = difficultyOrder[a.difficulty || ''] || 0
        const diffB = difficultyOrder[b.difficulty || ''] || 0
        return modifier * (diffA - diffB)
      case 'createdAt':
      default:
        return modifier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
  })

  // Helper component for sortable headers
  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => {
    const isActive = sort === field
    const nextOrder = isActive && order === 'asc' ? 'desc' : 'asc'
    
    return (
      <TableHead>
        <Link href={`/admin?sort=${field}&order=${nextOrder}`} className="flex items-center gap-1 hover:text-primary transition-colors">
          {label}
          {isActive ? (
            order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </Link>
      </TableHead>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">文章管理 (Article Management)</h1>
        <div className="flex gap-2">
           <Link href="/admin/categories">
            <Button variant="outline">分类管理 (Categories)</Button>
          </Link>
          <Link href="/admin/import">
            <Button variant="outline">智能导入 (Smart Import)</Button>
          </Link>
          <Link href="/admin/new">
            <Button>新建文章 (New Article)</Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="title" label="标题 (Title)" />
              <SortableHeader field="category" label="分类 (Category)" />
              <TableHead>场区 (Court Area)</TableHead>
              <SortableHeader field="difficulty" label="难度 (Difficulty)" />
              <SortableHeader field="createdAt" label="创建时间 (Created)" />
              <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.1)]">操作 (Actions)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{article.title}</span>
                    {/* Debug info if needed: <span className="text-xs text-muted-foreground">{article.id}</span> */}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {article.categories.map(c => (
                      <Badge key={c.id} variant="secondary" className="text-xs">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{article.court_area || '-'}</TableCell>
                <TableCell>
                  {article.difficulty && (
                    <Badge variant="outline">{article.difficulty}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(article.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.1)]">
                  <div className="flex justify-end items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/edit/${article.id}`}>
                        <Pencil className="h-4 w-4 mr-1" />
                        编辑
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/article/${article.id}`}>查看</Link>
                    </Button>
                    <DeleteButton id={article.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
