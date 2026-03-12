import path from "path"
import fs from "fs/promises"
import { existsSync } from "fs"

export type UploadItem = {
  name: string
  url: string
  type: "image" | "video" | "other"
  size: number
  mtime: number
}

const imageExts = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"])
const videoExts = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"])

export async function listUploads(): Promise<UploadItem[]> {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) return []

    const entries = await fs.readdir(uploadDir)

    const items = await Promise.all(
      entries.map(async (name) => {
        if (name.startsWith(".")) return null
        const filePath = path.join(uploadDir, name)
        const stat = await fs.stat(filePath)
        if (!stat.isFile()) return null

        const ext = path.extname(name).toLowerCase()
        const type = imageExts.has(ext)
          ? "image"
          : videoExts.has(ext)
            ? "video"
            : "other"

        return {
          name,
          url: `/uploads/${name}`,
          type,
          size: stat.size,
          mtime: stat.mtimeMs,
        } as UploadItem
      })
    )

    return items
      .filter((item): item is UploadItem => Boolean(item))
      .sort((a, b) => b.mtime - a.mtime)
  } catch (error) {
    console.error("Failed to list uploads", error)
    return []
  }
}
