import fs from "fs/promises"
import path from "path"

const INDEX_PATH = path.join(process.cwd(), "data", "kb_index.json")

export const resolveDocIdToPath = async (docId: string) => {
  const raw = JSON.parse(await fs.readFile(INDEX_PATH, "utf-8")) as { items: any[] }
  const item = raw.items.find((i) => i.doc_id === docId)
  return item?.file_path as string | undefined
}
