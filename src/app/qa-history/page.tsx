import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function QaHistoryPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = (searchParams?.q || "").trim()
  const items = await prisma.qaHistory.findMany({
    where: q
      ? {
          OR: [
            { question: { contains: q } },
            { answer: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-2xl font-bold">斛兵论道</div>
      <form className="flex gap-3" action="/qa-history" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索历史问答"
          className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm focus:outline-none"
        />
        <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          搜索
        </button>
      </form>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            暂无记录
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/qa/${item.id}`}
              className="block rounded-xl border bg-card p-4 transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleString("zh-CN")}
              </div>
              <div className="mt-2 font-medium hover:text-primary transition-colors">
                {item.question}
              </div>
              {item.answer && (
                <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  斛教练：{item.answer.replace(/\n+/g, " ").slice(0, 240)}
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
