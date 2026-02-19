import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { syncArticleToMarkdown } from '@/lib/sync-files'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      mode, // 'create' | 'append'
      targetId, // categoryId if mode='create', articleId if mode='append'
      title, 
      content, 
      tags: rawTags, 
      court_area, 
      difficulty,
      summary 
    } = body

    // 1. Resolve Tags safely to avoid Unique Constraint violations
    const rawTagList = Array.isArray(rawTags) ? rawTags : []
    const tagIds: string[] = []

    for (const tagName of rawTagList) {
      const cleanName = tagName.trim()
      if (!cleanName) continue

      const slug = cleanName.toLowerCase().replace(/\s+/g, '-')

      // Try to find existing tag
      const existingTag = await prisma.tag.findFirst({
        where: {
          OR: [
            { slug: slug },
            { name: cleanName }
          ]
        }
      })

      if (existingTag) {
        tagIds.push(existingTag.id)
      } else {
        try {
          // Try to create
          const newTag = await prisma.tag.create({
            data: { name: cleanName, slug }
          })
          tagIds.push(newTag.id)
        } catch (e) {
          // If creation failed (likely race condition or collision), try fetching again
          const retryTag = await prisma.tag.findFirst({
            where: {
              OR: [
                { slug: slug },
                { name: cleanName }
              ]
            }
          })
          if (retryTag) {
            tagIds.push(retryTag.id)
          } else {
            console.error(`Failed to create or find tag: ${cleanName}`, e)
          }
        }
      }
    }

    // Deduplicate IDs
    const uniqueTagIds = Array.from(new Set(tagIds))
    const tagConnection = uniqueTagIds.map(id => ({ id }))

    let articleId

    if (mode === 'create') {
      if (!targetId) throw new Error('Category ID is required for creation')
      
      const article = await prisma.article.create({
        data: {
          title,
          content,
          categories: {
            connect: [{ id: targetId }]
          },
          court_area,
          difficulty,
          tags: {
            connect: tagConnection
          }
        }
      })
      articleId = article.id
    } else if (mode === 'append') {
      if (!targetId) throw new Error('Article ID is required for appending')

      const existing = await prisma.article.findUnique({ where: { id: targetId } })
      if (!existing) throw new Error('Target article not found')

      const newContent = existing.content + '\n\n' + content
      
      const article = await prisma.article.update({
        where: { id: targetId },
        data: {
          content: newContent,
          // Merge new tags with existing ones
          tags: {
            connect: tagConnection
          }
        }
      })
      articleId = article.id
    } else {
      throw new Error('Invalid mode')
    }

    revalidatePath('/')
    revalidatePath('/admin')
    
    // Sync to file system
    await syncArticleToMarkdown(articleId)

    return NextResponse.json({ success: true, articleId })

  } catch (error: any) {
    console.error('Save Article Error:', error)
    return NextResponse.json({ error: error.message || 'Save failed' }, { status: 500 })
  }
}
