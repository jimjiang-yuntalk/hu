import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from 'next/link'
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import ChatSearch from "@/components/ChatSearch"

export default async function Home() {
  const netArticles = await prisma.article.findMany({
    where: { court_area: 'Net' },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })
  
  const midArticles = await prisma.article.findMany({
    where: { court_area: 'Mid' },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })
  
  const rearArticles = await prisma.article.findMany({
    where: { court_area: 'Rear' },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      <div className="text-center space-y-4 py-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">斛教练</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          提升你的比赛水平：专业技术、战术意识与科学训练体系
        </p>
      </div>

      <ChatSearch />

      <Section title="网前技术 (Net Play)" articles={netArticles} />
      <Section title="中场技术 (Mid-Court)" articles={midArticles} />
      <Section title="后场技术 (Rear-Court)" articles={rearArticles} />
    </div>
  )
}

function Section({ title, articles }: { title: string, articles: any[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
         <div className="h-8 w-1 bg-secondary rounded-full"></div>
         <h2 className="text-2xl font-bold text-foreground">{title}</h2>
         <Separator className="flex-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <Card key={article.id} className="hover:shadow-md transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-secondary">
            <CardHeader>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                <Link href={`/article/${article.id}`}>
                  {article.title}
                </Link>
              </CardTitle>
              <div className="flex gap-2 mt-2">
                 <Badge variant="secondary" className="font-normal text-xs">
                   {article.difficulty?.replace('L', 'Level ').replace('_', ' ') || 'General'}
                 </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-3" 
                   dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
