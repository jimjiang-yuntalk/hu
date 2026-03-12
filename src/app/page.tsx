import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listUploads } from "@/lib/uploads"
import { readVideoChannelConfig } from "@/lib/video-channel"
import { readSocialConfig } from "@/lib/social-config"
import { readQuotes } from "@/lib/quotes"

export const dynamic = "force-dynamic"

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const truncateText = (text: string, maxLength = 90) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}…` : text

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(i)
  }
  return hash >>> 0
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const getShanghaiDateKey = () => {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" })
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

const pickDailyRandom = <T,>(items: T[], count: number, seedKey: string) => {
  if (items.length <= count) return items
  const rng = mulberry32(hashString(seedKey))
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export default async function Home() {
  const [topCategories, recentQas, articles, uploads, videoChannel, socialConfig, quotes] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.qaHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.article.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),
    listUploads(),
    readVideoChannelConfig(),
    readSocialConfig(),
    readQuotes(),
  ])

  const dailyArticles = pickDailyRandom(articles, 2, getShanghaiDateKey())
  const previewUploads = uploads.slice(0, 2)
  const previewVideoItems = (videoChannel?.items || []).slice(0, 2)
  const previewItems = [...previewVideoItems, ...previewUploads]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-6">
      <div className="text-center space-y-2 py-6">
        <p className="elegant-slogan text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto italic">在球场成为时间的朋友</p>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-background/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">羽拨心弦</CardTitle>
              <Link
                href="/user-settings"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                球友日常
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              {previewVideoItems.length === 0 ? (
                <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">暂无内容</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {previewVideoItems.map((item: any) => (
                    <a
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg overflow-hidden border bg-card/60"
                    >
                      {item.cover ? (
                        <img src={item.cover} alt={item.title} className="h-24 w-full object-cover" />
                      ) : (
                        <video src={item.url} className="h-24 w-full object-cover" muted playsInline preload="metadata" poster={item.url.replace(/\.[^/.]+$/, ".jpg")} />
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              {previewUploads.length === 0 ? (
                <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">暂无内容</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {previewUploads.map((item: any) => (
                    <Link
                      key={item.name}
                      href={`/media/${encodeURIComponent(item.name)}`}
                      className="block rounded-lg overflow-hidden border bg-card/60"
                    >
                      {item.type === "image" ? (
                        <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
                      ) : item.type === "video" ? (
                        <video src={item.url} className="h-24 w-full object-cover" muted playsInline preload="metadata" poster={item.url.replace(/\.[^/.]+$/, ".jpg")} />
                      ) : (
                        <div className="h-24 w-full flex items-center justify-center text-xs text-muted-foreground">
                          文件
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>          </CardContent>
        </Card>

        <Card className="bg-background/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">斛兵论道</CardTitle>
              <Link
                href="/qa-history"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                绕塘一圈
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentQas.length === 0 ? (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                暂无记录
              </div>
            ) : (
              recentQas.map((qa) => (
                <Link
                  key={qa.id}
                  href={`/qa/${qa.id}`}
                  className="group block rounded-lg border bg-card/60 p-4 transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="text-xs text-muted-foreground">
                    {formatDate(qa.createdAt)}
                  </div>
                  <div className="mt-1 font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    Q：{qa.question}
                  </div>
                  {qa.answer && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      A：{truncateText(qa.answer.replace(/\s+/g, " "), 120)}
                    </div>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">乒羽图谱</CardTitle>
              <Link
                href="/tag-cloud"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                乒羽词云
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                暂无分类
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.map((parent) => (
                  <div key={parent.id}>
                    <div className="text-sm font-semibold">
                      {parent.name.split("(")[0].trim()}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {parent.children.length > 0 ? (
                        parent.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          >
                            {child.name.split("(")[0].trim()}
                          </Link>
                        ))
                      ) : (
                        <Link
                          href={`/category/${parent.slug}`}
                          className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          {parent.name.split("(")[0].trim()}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">健身头条</CardTitle>
              <Link
                href="/kb"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                知识库
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyArticles.length === 0 ? (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                暂无文章
              </div>
            ) : (
              dailyArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="group block rounded-lg border bg-card/60 p-4 transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="text-xs text-muted-foreground">
                    {formatDate(article.createdAt)}
                  </div>
                  <div className="mt-1 font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {truncateText(stripHtml(article.content), 120)}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">羽坛金句</CardTitle>
              <Link
                href="/quotes"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quotes.length === 0 ? (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">暂无金句</div>
            ) : (
              quotes.slice(0, 3).map((quote) => (
                <div key={quote.id} className="rounded-lg border bg-card/60 p-4">
                  <div className="text-sm">“{quote.content}”</div>
                  {quote.author && <div className="mt-2 text-xs text-muted-foreground">—— {quote.author}</div>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
