import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CourtArea } from '@prisma/client'

const courtAreaMap: Record<string, string> = {
  'Net': '网前',
  'Mid': '中场',
  'Rear': '后场',
  'Full': '全场',
}

export default async function AreaPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  
  // Validate type
  if (!Object.keys(courtAreaMap).includes(type)) {
    notFound()
  }

  const articles = await prisma.article.findMany({
    where: { court_area: type as CourtArea },
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  })

  const label = courtAreaMap[type]

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">首页</Link>
          <span>/</span>
          <span className="font-medium text-foreground">场地区域</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{label}区域文章</h1>
        <p className="text-xl text-muted-foreground">
          {articles.length} 篇文章 (Articles)
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-secondary h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/article/${article.id}`} className="hover:underline decoration-secondary underline-offset-4">
                    {article.title}
                  </Link>
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.difficulty && (
                    <Badge variant="secondary" className="font-normal text-xs bg-secondary/10 text-secondary-foreground border-secondary/20 border">
                      {article.difficulty.replace('L', 'Lv').replace('_', ' ')}
                    </Badge>
                  )}
                  {article.categories.map(c => (
                    <Badge key={c.id} variant="secondary" className="font-normal text-xs">
                      {c.name.split('(')[0]}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div 
                  className="text-sm text-muted-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: article.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' }}
                />
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button variant="ghost" className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors" asChild>
                  <Link href={`/article/${article.id}`}>阅读全文 &rarr;</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-xl font-medium text-muted-foreground mb-2">暂无内容</h3>
          <p className="text-sm text-muted-foreground mb-6">该区域下还没有发布任何技术文章。</p>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
