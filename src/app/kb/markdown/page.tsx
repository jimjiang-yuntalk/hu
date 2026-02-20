import path from "path"
import fs from "fs/promises"
import { notFound } from "next/navigation"
import { marked } from "marked"

export default async function MarkdownPage({
  searchParams,
}: {
  searchParams: { file?: string }
}) {
  const fileParam = searchParams?.file
  if (!fileParam) return notFound()

  const filePath = Buffer.from(fileParam, "base64url").toString("utf-8")
  const baseDir = path.join(process.cwd(), "ybxy")
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(baseDir)) return notFound()

  const content = await fs.readFile(resolved, "utf-8")
  const html = marked.parse(content)

  return (
    <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
