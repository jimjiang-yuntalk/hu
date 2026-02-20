import { NextRequest, NextResponse } from "next/server"
import { searchKnowledge } from "@/lib/kb-search"

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "缺少问题" }, { status: 400 })
    }

    const sources = await searchKnowledge(query, 6)

    const answer = sources.length > 0
      ? "已从知识库中找到相关内容，见下方来源链接。"
      : "知识库中未找到相关内容。"

    return NextResponse.json({ answer, sources })
  } catch (e) {
    console.error("chat error:", e)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
