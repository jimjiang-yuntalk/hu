import { NextRequest, NextResponse } from "next/server"
import { searchRag } from "@/lib/kb-search-rag"
import { openclawResponses } from "@/lib/openclaw-client"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "缺少问题" }, { status: 400 })
    }

    const citations = await searchRag(query, 8)
    if (citations.length === 0) {
      const answer_markdown = "知识库中暂无相关依据。建议补充相关条目或提供更具体的问题。"
      let qaId = ""

      try {
        const qa = await prisma.qaHistory.create({
          data: {
            question: query,
            answer: answer_markdown,
            citations_json: JSON.stringify([]),
          },
        })
        qaId = qa.id
      } catch (e) {
        console.error("qa history save error:", e)
      }

      return NextResponse.json({
        answer_markdown,
        citations: [],
        qaId,
      })
    }

    const citeHint = citations
      .map((c) => `- ${c.cite_id}: ${c.title} / ${c.heading} => ${c.snippet}`)
      .join("\n")

    const prompt = `你是“斛教练知识库助手”。仅基于给定证据回答，使用中文，结构化要点化。
要求：
1) 每个关键结论必须用引用标注，格式：[标题](cite:cite_id)
2) 每条结论至少1个引用，最好2个引用
3) 不确定需标注“可能/推测”
4) 不要编造证据

用户问题：${query}

证据列表：\n${citeHint}\n`

    const answer_markdown = await openclawResponses(prompt, { user: `kb:${query.slice(0, 50)}` })
    
    let qaId = "";

    try {
      const qa = await prisma.qaHistory.create({
        data: {
          question: query,
          answer: answer_markdown,
          citations_json: JSON.stringify(citations || []),
        },
      })
      qaId = qa.id;
    } catch (e) {
      console.error("qa history save error:", e)
    }

    return NextResponse.json({ answer_markdown, citations, qaId })
  } catch (e) {
    console.error("chat error:", e)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
