import fs from "fs/promises"
import path from "path"

export type ShareRecord = {
  share_id: string
  type: "qa" | "report"
  content_markdown: string
  citations: any[]
  created_at: string
  source_snapshot?: string
  access: "public" | "private"
  token?: string
}

const STORE_PATH = path.join(process.cwd(), "data", "shares.json")

const readAll = async (): Promise<ShareRecord[]> => {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const writeAll = async (items: ShareRecord[]) => {
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2))
}

export const createShare = async (record: ShareRecord) => {
  const items = await readAll()
  items.unshift(record)
  await writeAll(items)
  return record
}

export const getShare = async (id: string) => {
  const items = await readAll()
  return items.find((i) => i.share_id === id)
}
