import path from "path"
import fs from "fs/promises"
import { notFound } from "next/navigation"
import { renderMarkdown } from "@/lib/markdown-render"
import { resolveDocIdToPath } from "@/lib/doc-resolver"

export default async function DocPage({ params }: { params: Promise<{ doc_id: string }> | { doc_id: string } }) {
  const p: any = await (params as any)
  const docId = p?.doc_id
  const filePath = await resolveDocIdToPath(docId)
  if (!filePath) return notFound()

  const baseDir = path.join(process.cwd(), "ybxy")
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(baseDir)) return notFound()

  const content = await fs.readFile(resolved, "utf-8")
  const html = renderMarkdown(content)

  return (
    <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
