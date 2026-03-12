import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'

const requireAuth = (req: NextRequest) => {
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

export async function POST(req: NextRequest) {
  try {
    if (!requireAuth(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uploadDir = path.join(process.cwd(), 'public', 'social')

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    const url = `/social/${filename}`

    return NextResponse.json({ url })
  } catch (e) {
    console.error('Social upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
