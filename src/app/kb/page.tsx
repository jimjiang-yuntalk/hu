import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function KnowledgeBasePage() {
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">知识库</h1>
        <p className="text-muted-foreground">文章标题列表</p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">暂无内容</div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
              >
                <div className="font-medium break-all">{article.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(article.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
