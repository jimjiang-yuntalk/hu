import { NextRequest, NextResponse } from "next/server"
import { getShare } from "@/lib/share-store"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const record = await getShare(id)
    if (!record) return NextResponse.json({ error: "not found" }, { status: 404 })

    if (record.access === "private") {
      const token = req.nextUrl.searchParams.get("token")
      if (!token || token !== record.token) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 })
      }
    }

    return NextResponse.json(record)
  } catch (e) {
    console.error("share get error:", e)
    return NextResponse.json({ error: "读取失败" }, { status: 500 })
  }
}
