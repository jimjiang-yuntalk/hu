import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SharePanel from "@/components/SharePanel"

export const dynamic = "force-dynamic"

export default async function PingYuMapPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">乒羽图谱</h1>
        <p className="text-muted-foreground">
          <Link href="/tag-cloud" className="text-primary hover:underline">
            乒羽词云
          </Link>
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        {categories.length === 0 ? (
          <div className="text-sm text-muted-foreground">暂无技术目录</div>
        ) : (
          categories.map((parent) => (
            <div key={parent.id} className="space-y-3">
              <div className="text-base font-semibold">
                {parent.name.split("(")[0].trim()}
              </div>
              {parent.children.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无子目录</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {parent.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      {child.name.split("(")[0].trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <SharePanel />
    </div>
  )
}
