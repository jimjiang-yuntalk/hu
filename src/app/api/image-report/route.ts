import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import path from "path"
import fs from "fs/promises"

const MODEL = process.env.OPENAI_MODEL || "gpt-5.2-codex"

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
    default:
      return "application/octet-stream"
  }
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "缺少图片地址" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY 未配置" }, { status: 500 })
    }

    let dataUrl = imageUrl

    if (imageUrl.startsWith("/uploads/")) {
      const ext = path.extname(imageUrl)
      const mime = mimeFromExt(ext)
      const filePath = path.join(process.cwd(), "public", imageUrl)
      const buffer = await fs.readFile(filePath)
      const base64 = buffer.toString("base64")
      dataUrl = `data:${mime};base64,${base64}`
    }

    const client = new OpenAI({ apiKey })
    const prompt = `请以“斛教练点评”为标题，从羽毛球训练/技术视角分析这张图片，输出三部分：\n1) 优点\n2) 特点\n3) 提升的地方\n要求中文、简洁有条理。`

    const resp = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: dataUrl },
          ],
        },
      ],
    })

    const text = resp.output_text || ""
    return NextResponse.json({ report: text })
  } catch (e) {
    console.error("image report error:", e)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
