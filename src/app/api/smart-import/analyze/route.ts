import { NextRequest, NextResponse } from 'next/server'
import { classifyAndParseContent } from '@/lib/ai-classifier'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'

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

    // Return the analysis result without saving
    return NextResponse.json({ 
      success: true, 
      analysis 
    })

  } catch (error: any) {
    console.error('Smart Import Analysis Error:', error)
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
  }
}
