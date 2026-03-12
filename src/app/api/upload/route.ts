import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { generateThumbnail } from '@/lib/generate-thumbnail'

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
    // Use simple timestamp + original name, ensure safe chars
    const filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure directory exists (sync check is fine here)
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    
    // Use async write to ensure completion
    await fs.writeFile(filePath, buffer)

    // Generate thumbnail for video files
    const ext = path.extname(filename).toLowerCase()
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
      const thumbnailPath = path.join(uploadDir, filename.replace(/\.[^/.]+$/, '.jpg'))
      await generateThumbnail(filePath, thumbnailPath)
    }

    // Force forward slashes for URL path, ensuring it works on Windows
    // public folder is root, so url is /uploads/filename
    const url = `/uploads/${filename}`

    return NextResponse.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
