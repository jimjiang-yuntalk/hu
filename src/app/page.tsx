import fs from "fs/promises"
import path from "path"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const INDEX_PATH = path.join(process.cwd(), "data", "kb_index.json")

export default async function Home() {
  const raw = JSON.parse(await fs.readFile(INDEX_PATH, "utf-8")) as { items: any[] }
  const unique = new Map<string, any>()
  for (const item of raw.items) {
    if (!unique.has(item.doc_id)) unique.set(item.doc_id, item)
  }

  const items = Array.from(unique.values())
    .map((item) => {
      const rel = item.file_path.replace(path.join(process.cwd(), "ybxy") + path.sep, "")
      const parts = rel.split(path.sep)
      const category = parts.length > 1 ? parts[0] : "知识库"
      return { ...item, category }
    })
    .sort((a, b) => a.title.localeCompare(b.title, "zh"))

  const grouped = items.reduce((acc: Record<string, any[]>, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      <div className="text-center space-y-4 py-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">斛教练</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          全量知识库导航 · 结构化检索 · 一键直达
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(grouped).map(([category, docs]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1 rounded-full bg-secondary" />
              <h2 className="text-2xl font-bold text-foreground">{category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((doc) => (
                <Card
                  key={doc.doc_id}
                  className="hover:shadow-md transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-secondary"
                >
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      <Link href={doc.url}>{doc.title}</Link>
                    </CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="font-normal text-xs">
                        {doc.heading}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {String(doc.content || "").slice(0, 120)}...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
