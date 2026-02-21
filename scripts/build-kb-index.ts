import fs from "fs/promises"
import path from "path"
import { buildKbChunks } from "../src/lib/kb-indexer"

const INDEX_PATH = path.join(process.cwd(), "data", "kb_index.json")

const main = async () => {
  const chunks = await buildKbChunks()
  await fs.writeFile(INDEX_PATH, JSON.stringify({ created_at: Date.now(), items: chunks }, null, 2))
  console.log(`KB index saved: ${INDEX_PATH} (items=${chunks.length})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
