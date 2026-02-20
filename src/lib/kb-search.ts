import path from "path"
import fs from "fs/promises"
import { prisma } from "@/lib/prisma"

export type SearchSource = {
  type: "article" | "markdown"
  title: string
  snippet: string
  link: string
  score: number
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const normalize = (text: string) => text.toLowerCase()

const scoreText = (text: string, query: string) => {
  const t = normalize(text)
  const q = normalize(query)
  if (!q) return 0
  let score = 0
  let idx = t.indexOf(q)
  while (idx !== -1) {
    score += 1
    idx = t.indexOf(q, idx + q.length)
  }
  return score
}

const encodeFileParam = (filePath: string) => Buffer.from(filePath).toString("base64url")

export async function searchKnowledge(query: string, limit = 8): Promise<SearchSource[]> {
  if (!query) return []

  const sources: SearchSource[] = []

  const articles = await prisma.article.findMany({
    select: { id: true, title: true, content: true },
  })

  for (const article of articles) {
    const text = stripHtml(article.content || "")
    const score = scoreText(`${article.title} ${text}`, query)
    if (score > 0) {
      sources.push({
        type: "article",
        title: article.title,
        snippet: text.slice(0, 200),
        link: `/article/${article.id}`,
        score,
      })
    }
  }

  const ybxyDir = path.join(process.cwd(), "ybxy")
  try {
    const files = await listMarkdownFiles(ybxyDir)
    for (const file of files) {
      const content = await fs.readFile(file, "utf-8")
      const text = content.replace(/[#>*_`\-]+/g, " ").replace(/\s+/g, " ").trim()
      const score = scoreText(text, query)
      if (score > 0) {
        const title = extractTitle(content) || path.basename(file, ".md")
        const fileParam = encodeFileParam(file)
        sources.push({
          type: "markdown",
          title,
          snippet: text.slice(0, 200),
          link: `/kb/markdown?file=${fileParam}`,
          score,
        })
      }
    }
  } catch (e) {
    // ignore if folder missing
  }

  return sources
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(full)))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(full)
    }
  }

  return files
}

function extractTitle(content: string) {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim()
}
