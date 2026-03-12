import { NextResponse } from 'next/server'
import { readSocialConfig, writeSocialConfig } from '@/lib/social-config'

export async function GET() {
  const config = await readSocialConfig()
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
    const next = {
      videoName: String(body?.videoName || ''),
      videoQrUrl: String(body?.videoQrUrl || ''),
      videoFollowUrl: String(body?.videoFollowUrl || ''),
      mpName: String(body?.mpName || ''),
      mpQrUrl: String(body?.mpQrUrl || ''),
      mpFollowUrl: String(body?.mpFollowUrl || ''),
    }
    await writeSocialConfig(next)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save social config', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
