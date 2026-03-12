import fs from "fs/promises"
import path from "path"
import { buildKbChunks, KbChunk } from "./kb-indexer"

export type Citation = {
  cite_id: string
  doc_id: string
  file_path: string
  title: string
  heading: string
  anchor: string
  url: string
  snippet: string
  offset?: { paragraph?: number; start?: number; end?: number }
  score?: number
}

type KbIndexItem = KbChunk

const INDEX_PATH = path.join(process.cwd(), "data", "kb_index.json")

const buildKeywords = (query: string) => {
  const q = query.trim()
  if (!q) return [] as string[]
  const basic = q
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)

  const chinese = q.replace(/\s+/g, "")
  const grams: string[] = []
  if (chinese.length >= 2) {
    for (let i = 0; i < chinese.length - 1; i++) {
      grams.push(chinese.slice(i, i + 2))
    }
  }
  if (chinese.length >= 3) {
    for (let i = 0; i < chinese.length - 2; i++) {
      grams.push(chinese.slice(i, i + 3))
    }
  }
  return Array.from(new Set([...basic, ...grams]))
}

const keywordScore = (text: string, query: string) => {
  if (!query) return 0
  const t = text.toLowerCase()
  const keywords = buildKeywords(query)
  let score = 0
  for (const k of keywords) {
    if (!k) continue
    let idx = t.indexOf(k)
    while (idx !== -1) {
      score += k.length >= 3 ? 2 : 1
      idx = t.indexOf(k, idx + k.length)
    }
  }
  return score
}

export async function ensureIndex() {
  try {
    await fs.access(INDEX_PATH)
  } catch {
    const chunks = await buildKbChunks()
    await fs.writeFile(INDEX_PATH, JSON.stringify({ created_at: Date.now(), items: chunks }, null, 2))
  }
}

export async function searchRag(query: string, topK = 8): Promise<Citation[]> {
  if (!query) return []
  await ensureIndex()
  const raw = JSON.parse(await fs.readFile(INDEX_PATH, "utf-8")) as { items: KbIndexItem[] }

  const scored = raw.items.map((item) => {
    const text = `${item.title} ${item.heading} ${item.content}`
    const score = keywordScore(text, query)
    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r, idx) => ({
      cite_id: `c${idx + 1}`,
      doc_id: r.item.doc_id,
      file_path: r.item.file_path,
      title: r.item.title,
      heading: r.item.heading,
      anchor: r.item.anchor,
      url: `/article/${encodeURIComponent(r.item.doc_id)}`,
      snippet: r.item.content.slice(0, 220),
      score: Number(r.score.toFixed(4)),
    }))
}
