import { prisma } from "@/lib/prisma"
import TagCloud from "@/components/TagCloud"
import SharePanel from "@/components/SharePanel"

export const dynamic = "force-dynamic"

export default async function TagCloudPage() {
  const categories = await prisma.category.findMany({
    include: {
      articles: true,
      parent: true,
    },
  })

  const tagData = categories
    .map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name.split("(")[0].trim(),
      count: cat.articles.length,
      category: cat.parent?.name || "其他",
    }))
    .filter((tag) => tag.count > 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">乒羽词云</h1>
        <p className="text-muted-foreground">
          <a href="/pingyu-map" className="text-primary hover:underline">乒羽图谱</a>
        </p>
      </div>

      <div className="bg-secondary/30 rounded-xl p-8">
        <TagCloud tags={tagData} />
      </div>

      <SharePanel />
    </div>
  )
}
