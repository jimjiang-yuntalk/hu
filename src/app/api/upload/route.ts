import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
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

    // Force forward slashes for URL path, ensuring it works on Windows
    // public folder is root, so url is /uploads/filename
    const url = `/uploads/${filename}`

    return NextResponse.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
