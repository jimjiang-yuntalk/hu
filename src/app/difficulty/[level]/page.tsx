import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Difficulty } from '@prisma/client'

// Reusing the map from article page for consistent labels
const difficultyMap: Record<string, string> = {
  'L1_Beginner': '初级 (Level 1)',
  'L2_Amateur': '业余 (Level 2)',
  'L3_Advanced': '进阶 (Level 3)',
  'L4_Pro': '专业 (Level 4)',
}

export default async function DifficultyPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params
  
  // Validate level
  if (!Object.keys(difficultyMap).includes(level)) {
    notFound()
  }

  const articles = await prisma.article.findMany({
    where: { difficulty: level as Difficulty },
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  })

  const label = difficultyMap[level]

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">首页</Link>
          <span>/</span>
          <span className="font-medium text-foreground">难度等级</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{label}</h1>
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
                  {article.court_area && (
                    <Badge variant="outline" className="font-normal text-xs">
                      {article.court_area}
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
          <p className="text-sm text-muted-foreground mb-6">该难度等级下还没有发布任何技术文章。</p>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
