import { NextResponse } from 'next/server'
import { readVideoChannelConfig, writeVideoChannelConfig } from '@/lib/video-channel'

export async function GET() {
  const config = await readVideoChannelConfig()
  return NextResponse.json(config)
}

const requireAuth = (req: Request) => {
  const adminPass = process.env.ADMIN_PASSWORD || ''
  if (!adminPass) return true

  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|; )admin_auth=([^;]+)/)
  if (match) {
    const value = decodeURIComponent(match[1])
    if (value === adminPass) return true
  }

  const auth = req.headers.get('authorization') || ''
  if (!auth.startsWith('Basic ')) return false
  const base64 = auth.replace('Basic ', '')
  try {
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    const [, pass] = decoded.split(':')
    return pass === adminPass
  } catch {
    return false
  }
}

export async function PUT(req: Request) {
  try {
    if (!requireAuth(req)) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const items = Array.isArray(body?.items) ? body.items : []
    const cleaned = items
      .map((item: any) => ({
        title: String(item?.title || '').trim(),
        url: String(item?.url || '').trim(),
        cover: String(item?.cover || '').trim(),
      }))
      .filter((item: any) => item.title || item.url || item.cover)

    const next = {
      name: String(body?.name || '羽拨心弦'),
      followUrl: String(body?.followUrl || ''),
      qrImageUrl: String(body?.qrImageUrl || ''),
      items: cleaned,
    }

    await writeVideoChannelConfig(next)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save video channel config', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
