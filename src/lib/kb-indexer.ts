import fs from "fs/promises"
import path from "path"
import { slugify } from "./slug"

export type KbChunk = {
  doc_id: string
  file_path: string
  title: string
  heading: string
  anchor: string
  url: string
  content: string
}

export const KB_ROOT = path.join(process.cwd(), "ybxy")

const base64url = (str: string) => Buffer.from(str).toString("base64url")

export const filePathToUrl = (filePath: string) => {
  const docId = makeDocId(filePath)
  return `/kb/doc/${docId}`
}

export const makeDocId = (filePath: string) => Buffer.from(filePath).toString("base64url")

export async function listMarkdownFiles(dir = KB_ROOT): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdownFiles(full)))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(full)
  }
  return files
}

export async function parseMarkdownToChunks(filePath: string): Promise<KbChunk[]> {
  const content = await fs.readFile(filePath, "utf-8")
  const lines = content.split(/\r?\n/)
  const title = lines.find((l) => l.startsWith("# "))?.replace(/^#\s+/, "") || path.basename(filePath, ".md")

  const chunks: KbChunk[] = []
  let currentHeading = title
  let currentAnchor = slugify(currentHeading)
  let buffer: string[] = []

  const flush = () => {
    const text = buffer.join("\n").trim()
    if (!text) return
    const paragraphs = text.split(/\n{2,}/)
    for (const p of paragraphs) {
      const cleaned = p.replace(/[#>*_`\-]+/g, " ").replace(/\s+/g, " ").trim()
      if (!cleaned) continue
      chunks.push({
        doc_id: makeDocId(filePath),
        file_path: filePath,
        title,
        heading: currentHeading,
        anchor: currentAnchor,
        url: filePathToUrl(filePath),
        content: cleaned,
      })
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flush()
      currentHeading = headingMatch[2].trim()
      currentAnchor = slugify(currentHeading)
      buffer = []
    } else {
      buffer.push(line)
    }
  }
  flush()

  return chunks
}

export async function buildKbChunks(): Promise<KbChunk[]> {
  const files = await listMarkdownFiles()
  const chunks: KbChunk[] = []
  for (const file of files) {
    chunks.push(...(await parseMarkdownToChunks(file)))
  }
  return chunks
}
