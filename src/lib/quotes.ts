import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export type QuoteItem = {
  id: string
  content: string
  author?: string
  createdAt: string
}

const getConfigPath = () => path.join(process.cwd(), 'data', 'quotes.json')

export async function readQuotes(): Promise<QuoteItem[]> {
  try {
    const configPath = getConfigPath()
    if (!existsSync(configPath)) return []
    const raw = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((q) => q && typeof q.content === 'string')
      .map((q) => ({
        id: String(q.id || ''),
        content: String(q.content || '').trim(),
        author: q.author ? String(q.author).trim() : '',
        createdAt: q.createdAt ? String(q.createdAt) : new Date().toISOString(),
      }))
      .filter((q) => q.id && q.content)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error('Failed to read quotes', error)
    return []
  }
}

export async function writeQuotes(items: QuoteItem[]) {
  const configPath = getConfigPath()
  const dir = path.dirname(configPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(configPath, JSON.stringify(items, null, 2), 'utf-8')
}
