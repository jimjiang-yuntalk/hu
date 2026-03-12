import { NextResponse } from "next/server"
import { listUploads } from "@/lib/uploads"

export async function GET() {
  const items = await listUploads()
  return NextResponse.json({ items })
}
