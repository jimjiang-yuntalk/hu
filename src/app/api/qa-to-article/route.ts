import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"

const requireAuth = (req: NextRequest) => {
  const adminPass = process.env.ADMIN_PASSWORD || ""
  if (!adminPass) return true
  const cookie = req.headers.get("cookie") || ""
  const match = cookie.match(/(?:^|; )admin_auth=([^;]+)/)
  if (match) {
    const value = decodeURIComponent(match[1])
    if (value === adminPass) return true
  }
  const auth = req.headers.get("authorization") || ""
  if (!auth.startsWith("Basic ")) return false
  const base64 = auth.replace("Basic ", "")
  try {
    const decoded = Buffer.from(base64, "base64").toString("utf-8")
    const [, pass] = decoded.split(":")
    return pass === adminPass
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!requireAuth(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "缺少问答 ID" }, { status: 400 })
    }
    const qa = await prisma.qaHistory.findUnique({ where: { id } })
    if (!qa) {
      return NextResponse.json({ error: "问答不存在" }, { status: 404 })
    }
    if (qa.articleId) {
      return NextResponse.json({ error: "该问答已转为文章" }, { status: 400 })
    }
    const title = (qa.question || "").trim() || "未命名问答"
    const content = `
      <h2>问题</h2>
      <p>${(qa.question || "").replace(/\n/g, "<br/>")}</p>
      <h2>回答</h2>
      <p>${(qa.answer || "").replace(/\n/g, "<br/>")}</p>
    `.trim()

    const defaultCategoryName = "斛兵论道"
    let category = await prisma.category.findFirst({ where: { name: defaultCategoryName } })
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: defaultCategoryName,
          slug: slugify(defaultCategoryName),
        },
      })
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        categories: {
          connect: [{ id: category.id }],
        },
      },
    })

    await prisma.qaHistory.update({
      where: { id: qa.id },
      data: { articleId: article.id },
    })

    revalidatePath("/pingyu-map")
    revalidatePath("/tag-cloud")
    revalidatePath("/admin/kb")

    return NextResponse.json({ articleId: article.id })
  } catch (e) {
    console.error("qa-to-article error:", e)
    return NextResponse.json({ error: "转换失败" }, { status: 500 })
  }
}
