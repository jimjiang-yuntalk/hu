import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteQaButton from './DeleteQaButton'
import ConvertQaButton from './ConvertQaButton'

export const dynamic = 'force-dynamic'

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = (searchParams?.q || '').trim()
  const items = await prisma.qaHistory.findMany({
    where: q
      ? {
          OR: [
            { question: { contains: q } },
            { answer: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  return (
    <div className="py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">斛兵论道运维</h1>
          <p className="text-muted-foreground mt-2">管理问答历史记录</p>
        </div>
        <Link href="/qa-history" className="text-sm text-muted-foreground hover:text-primary">
          查看前台问答
        </Link>
      </div>

      <form className="flex gap-3" action="/admin/qa" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索问答"
          className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm focus:outline-none"
        />
        <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          搜索
        </button>
      </form>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无记录</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString('zh-CN')}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/qa/${item.id}`} className="text-xs text-muted-foreground hover:text-primary">
                    查看
                  </Link>
                  <ConvertQaButton id={item.id} articleId={item.articleId} />
                  <DeleteQaButton id={item.id} />
                </div>
              </div>
              <div className="font-medium">Q：{item.question}</div>
              {item.answer && (
                <div className="text-sm text-muted-foreground line-clamp-3">
                  A：{item.answer.replace(/\n+/g, ' ').slice(0, 300)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
