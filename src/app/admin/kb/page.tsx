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
import DeleteButton from "../DeleteButton"
import { Difficulty } from '@prisma/client'

export const dynamic = 'force-dynamic'

type SortField = 'title' | 'category' | 'difficulty' | 'createdAt'
type SortOrder = 'asc' | 'desc'

interface AdminPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminKbPage({ searchParams }: AdminPageProps) {
  const params = await searchParams
  const sort = (params.sort as SortField) || 'createdAt'
  const order = (params.order as SortOrder) || 'desc'

  const articles = await prisma.article.findMany({
    include: { categories: true },
  })

  const sortedArticles = [...articles].sort((a, b) => {
    const modifier = order === 'asc' ? 1 : -1
    const collator = new Intl.Collator('zh-CN', { numeric: true })

    const catA = a.categories[0]?.name || ''
    const catB = b.categories[0]?.name || ''

    switch (sort) {
      case 'title':
        return modifier * collator.compare(a.title, b.title)
      case 'category':
        return modifier * collator.compare(catA, catB)
      case 'difficulty':
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

  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => {
    const isActive = sort === field
    const nextOrder = isActive && order === 'asc' ? 'desc' : 'asc'

    return (
      <TableHead>
        <Link href={`/admin/kb?sort=${field}&order=${nextOrder}`} className="flex items-center gap-1 hover:text-primary transition-colors">
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
    <div className="py-6 sm:py-10">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">知识库运维</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full sm:w-auto">
          <Link href="/admin/categories" className="w-full">
            <Button variant="outline" className="w-full">分类管理 (Categories)</Button>
          </Link>
          <Link href="/admin/import" className="w-full">
            <Button variant="outline" className="w-full">智能导入 (Smart Import)</Button>
          </Link>
          <Link href="/admin/new" className="w-full">
            <Button className="w-full">新建文章 (New Article)</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">乒羽图谱文章列表</h2>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[900px]">
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
                <TableCell>{article.court_area || '-'}
                </TableCell>
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
