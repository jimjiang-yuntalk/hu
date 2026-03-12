import { NextRequest, NextResponse } from 'next/server'
import { openclawResponsesWithImage } from '@/lib/openclaw-client'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'

const mimeFromExt = (ext: string) => {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, query } = await req.json()
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '缺少图片地址' }, { status: 400 })
    }

    let finalUrl = imageUrl
    if (imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', imageUrl)
      try {
        await fs.access(filePath)
      } catch {
        return NextResponse.json({ error: '找不到图片文件' }, { status: 404 })
      }

      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
      const proto = req.headers.get('x-forwarded-proto') || 'http'
      finalUrl = `${proto}://${host}${imageUrl}`
    }

    if (!finalUrl.startsWith('http')) {
      return NextResponse.json({ error: '仅支持图片上传' }, { status: 400 })
    }

    const hint = typeof query === 'string' && query.trim() ? `用户补充说明：${query.trim()}` : ''
    const prompt = [
      '你是羽毛球技术教练，请基于图片给出简短点评：',
      '- 优点（2~3条）',
      '- 改进点（2~3条）',
      '- 训练建议（3条）',
      '要求中文、简洁、条目化。',
      hint,
    ].filter(Boolean).join('\n')

    const answer = await openclawResponsesWithImage(prompt, finalUrl, { user: `img:${imageUrl}` })

    const qa = await prisma.qaHistory.create({
      data: {
        question: hint ? `图片问答：${hint}` : '图片问答：请点评这张图片',
        answer,
        citations_json: JSON.stringify([]),
      },
    })

    return NextResponse.json({ qaId: qa.id })
  } catch (e) {
    console.error('chat-image error:', e)
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
