import { NextRequest, NextResponse } from 'next/server'
import { classifyAndParseContent } from '@/lib/ai-classifier'
import { prisma } from '@/lib/prisma'
import * as cheerio from 'cheerio'
// const pdf = require('pdf-parse');

export const dynamic = 'force-dynamic'

// Move pdf-parse require inside the handler to avoid build-time execution issues
// const pdf = require('pdf-parse');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const url = formData.get('url') as string
    
    let rawText = ''

    // Step A: Parse Input
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      if (file.type === 'application/pdf') {
        const pdf = require('pdf-parse');
        const pdfData = await pdf(buffer)
        rawText = pdfData.text
      } else {
        // Assume text/markdown
        rawText = buffer.toString('utf-8')
      }
    } else if (url) {
      const res = await fetch(url)
      const html = await res.text()
      const $ = cheerio.load(html)
      // Remove noise
      $('script, style, nav, footer, iframe').remove()
      rawText = $('body').text().replace(/\s+/g, ' ').trim()
    } else {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 })
    }

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({ error: 'Content too short or empty' }, { status: 400 })
    }

    // Step B: AI Analysis
    const analysis = await classifyAndParseContent(rawText)

    // Step C: Auto-Save as Draft (Assuming we don't have a status field yet, we just create it)
    // If you want a 'Draft' status, you should add it to the schema. 
    // For now, we'll just create it directly.
    
    // Prepare tag connections (connect or create)
    const tags = Array.isArray(analysis.tags) ? analysis.tags : []
    const tagConnectOrCreate = tags.map((tagName: string) => {
      const slug = tagName.toLowerCase().trim().replace(/\s+/g, '-')
      return {
        where: { slug },
        create: { 
          name: tagName.trim(),
          slug
        }
      }
    })

    const article = await prisma.article.create({
      data: {
        title: analysis.title,
        content: analysis.content, // AI formatted markdown
        categories: {
          connect: [{ id: analysis.categoryId }]
        },
        court_area: analysis.court_area,
        difficulty: analysis.difficulty,
        tags: {
          connectOrCreate: tagConnectOrCreate
        }
        // video_url: analysis.video_url // AI might extract this if we asked, but currently not in prompt
      }
    })

    return NextResponse.json({ 
      success: true, 
      articleId: article.id,
      analysis 
    })

  } catch (error: any) {
    console.error('Smart Import Error:', error)
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 })
  }
}
