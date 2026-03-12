import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'poster generator moved to client' }, { status: 501 })
}
