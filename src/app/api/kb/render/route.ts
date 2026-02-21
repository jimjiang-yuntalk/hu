import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { renderMarkdown } from "@/lib/markdown-render"

export async function GET(req: NextRequest) {
  try {
    const fileParam = req.nextUrl.searchParams.get("file")
    if (!fileParam) return NextResponse.json({ error: "missing" }, { status: 400 })

    const filePath = Buffer.from(fileParam, "base64url").toString("utf-8")
    const baseDir = path.join(process.cwd(), "ybxy")
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(baseDir)) return NextResponse.json({ error: "forbidden" }, { status: 403 })

    const content = await fs.readFile(resolved, "utf-8")
    const html = renderMarkdown(content)
    return NextResponse.json({ html })
  } catch (e) {
    console.error("render error:", e)
    return NextResponse.json({ error: "render failed" }, { status: 500 })
  }
}
