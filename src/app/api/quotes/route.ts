import { NextResponse } from 'next/server'
import { readQuotes } from '@/lib/quotes'

export async function GET() {
  const items = await readQuotes()
  return NextResponse.json({ items })
}
