import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SharePanel from "@/components/SharePanel"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        include: { categories: true },
        orderBy: { createdAt: 'desc' }
      },
      parent: true,
      children: true
    }
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">首页</Link>
          <span>/</span>
          {category.parent && (
             <>
               <span className="text-muted-foreground">{category.parent.name.split('(')[0]}</span>
               <span>/</span>
             </>
          )}
          <span className="font-medium text-foreground">{category.name.split('(')[0]}</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{category.name}</h1>
        <p className="text-xl text-muted-foreground">
          {category.articles.length} 篇文章 (Articles)
        </p>

        <SharePanel />
      </div>

      {category.articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.articles.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`} className="block mb-6 no-underline">
              <Card className="hover:shadow-lg transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-secondary h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {article.difficulty && (
                      <Badge variant="secondary" className="font-normal text-xs bg-secondary/10 text-secondary-foreground border-secondary/20 border cursor-pointer hover:opacity-80">
                        {article.difficulty.replace('L', 'Lv').replace('_', ' ')}
                      </Badge>
                    )}
                    {article.court_area && (
                      <Badge variant="outline" className="font-normal text-xs cursor-pointer hover:opacity-80">
                        {article.court_area}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div 
                    className="text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' }}
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-xl font-medium text-muted-foreground mb-2">暂无文章</h3>
          <p className="text-sm text-muted-foreground mb-6">该分类下还没有发布任何技术文章。</p>
          <Button asChild>
            <Link href="/admin/new">去发布第一篇</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
