import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { searchKnowledge } from "@/lib/kb-search"

const MODEL = process.env.OPENAI_MODEL || "gpt-5.2-codex"

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "缺少问题" }, { status: 400 })
    }

    const sources = await searchKnowledge(query, 6)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY 未配置" }, { status: 500 })
    }

    const context = sources
      .map((s, i) => `【${i + 1}】${s.title}\n${s.snippet}`)
      .join("\n\n")

    const prompt = `你是羽毛球教练“斛教练”。根据提供的知识库内容回答用户问题。\n\n问题：${query}\n\n可用知识：\n${context}\n\n要求：\n- 中文回答，简洁清晰\n- 若知识不足，说明未在知识库中找到相关信息\n- 不编造`;

    const client = new OpenAI({ apiKey })
    const resp = await client.responses.create({
      model: MODEL,
      input: [{ role: "user", content: prompt }],
    })

    const answer = resp.output_text || ""
    return NextResponse.json({ answer, sources })
  } catch (e) {
    console.error("chat error:", e)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
