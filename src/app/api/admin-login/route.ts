import { NextResponse } from "next/server"
import { buildAdminAuthToken } from "@/lib/admin-auth"

export async function POST(req: Request) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const body = await req.json().catch(() => ({}))
  const password = body?.password || ""

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true }, { status: 200 })
  res.cookies.set("admin_auth", buildAdminAuthToken(ADMIN_PASSWORD), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
