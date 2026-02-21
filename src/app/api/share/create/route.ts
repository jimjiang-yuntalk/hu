import { NextRequest, NextResponse } from "next/server"
import { createShare } from "@/lib/share-store"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { type, content_markdown, citations, access } = await req.json()
    if (!type || !content_markdown) {
      return NextResponse.json({ error: "缺少内容" }, { status: 400 })
    }

    const share_id = crypto.randomBytes(8).toString("hex")
    const token = access === "private" ? crypto.randomBytes(12).toString("hex") : undefined

    const record = await createShare({
      share_id,
      type,
      content_markdown,
      citations: citations || [],
      created_at: new Date().toISOString(),
      source_snapshot: "kb_index.json",
      access: access || "public",
      token,
    })

    return NextResponse.json({ share_id: record.share_id, token: record.token })
  } catch (e) {
    console.error("share create error:", e)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
