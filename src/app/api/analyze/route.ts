import { NextRequest, NextResponse } from "next/server"
import { openclawResponsesWithImage } from "@/lib/openclaw-client"
import path from "path"
import fs from "fs/promises"
import { searchRag } from "@/lib/kb-search-rag"

// OpenClaw via Gateway

const mimeFromExt = (ext: string) => {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".webp":
      return "image/webp"
    case ".gif":
      return "image/gif"
    case ".mp4":
      return "video/mp4"
    default:
      return "application/octet-stream"
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mediaUrl } = await req.json()
    if (!mediaUrl || typeof mediaUrl !== "string") {
      return NextResponse.json({ error: "缺少媒体地址" }, { status: 400 })
    }

    // OpenClaw via Gateway

    let dataUrl = mediaUrl
    if (mediaUrl.startsWith("/uploads/")) {
      const ext = path.extname(mediaUrl)
      const mime = mimeFromExt(ext)
      const filePath = path.join(process.cwd(), "public", mediaUrl)
      const buffer = await fs.readFile(filePath)
      const base64 = buffer.toString("base64")
      dataUrl = `data:${mime};base64,${base64}`
    }

    const prompt = [
      "你是羽毛球技术教练。请输出一个 Markdown 报告，包含：",
      "- 总体结论（3~6句)",
      "- 技术要点诊断（动作/姿态/击球/步法/节奏）",
      "- 风险点与纠正建议（按优先级排序）",
      "- 训练方案（次数/组数/频率/注意事项）",
      "- 关键词 tags + 置信度（0-100）",
      "输出末尾用 JSON 区块给出 tags，例如：",
      "JSON: {\"tags\":[{\"keyword\":\"网前\",\"confidence\":80}]}",
      "如无法判断，请标注“推测”。",
    ].join("\n")

    if (!dataUrl.startsWith("data:image/") && !dataUrl.startsWith("http")) {
      return NextResponse.json({ error: "当前仅支持图片分析（视频请先截图）" }, { status: 400 })
    }

    const text = await openclawResponsesWithImage(prompt, dataUrl, { user: `media:${mediaUrl}` })
    const tagsMatch = text.match(/JSON:\s*({[\s\S]*})/)
    let tags: { keyword: string; confidence: number }[] = []
    if (tagsMatch) {
      try {
        const parsed = JSON.parse(tagsMatch[1])
        tags = parsed.tags || []
      } catch {}
    }

    const keywords = tags.map((t) => t.keyword).filter(Boolean)
    const citations = keywords.length ? await searchRag(keywords.join(" "), 6) : []

    return NextResponse.json({ report_markdown: text, tags, recommended_links: citations })
  } catch (e) {
    console.error("analyze error:", e)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
