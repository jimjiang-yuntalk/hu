import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag as TagIcon, Calendar, ArrowLeft } from 'lucide-react'

// Helper maps (duplicated for now, could be moved to shared utils)
const difficultyMap: Record<string, string> = {
  'L1_Beginner': '初级',
  'L2_Amateur': '业余',
  'L3_Advanced': '进阶',
  'L4_Pro': '专业',
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      articles: {
        include: {
          categories: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!tag) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <TagIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">#{tag.name}</h1>
            <p className="text-muted-foreground mt-1">
              共找到 {tag.articles.length} 篇相关文章
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tag.articles.map((article) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1 flex-wrap">
                    {article.categories.map(c => (
                      <Badge key={c.id} variant="secondary" className="text-xs">
                        {c.name.split('(')[0]}
                      </Badge>
                    ))}
                  </div>
                  {article.difficulty && (
                    <Badge variant="outline" className="text-xs border-primary/20 text-primary/80">
                      {difficultyMap[article.difficulty] || '未知'}
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {tag.articles.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            暂无相关文章
          </div>
        )}
      </div>
    </div>
  )
}
