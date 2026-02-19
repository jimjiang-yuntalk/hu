'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CourtArea, Difficulty } from '@prisma/client'
import { syncArticleToMarkdown, deleteArticleFile } from '@/lib/sync-files'

// Helper to process tags
async function processTags(tagsString: string) {
  const rawTags = tagsString.split(',').map(t => t.trim()).filter(Boolean)
  const tagIds: string[] = []

  for (const tagName of rawTags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-')
    
    // Try find existing by slug or name
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [
          { slug },
          { name: tagName }
        ]
      }
    })

    if (existing) {
      tagIds.push(existing.id)
    } else {
      try {
        const newTag = await prisma.tag.create({
          data: { name: tagName, slug }
        })
        tagIds.push(newTag.id)
      } catch (e) {
        // Retry fetch if race condition
        const retry = await prisma.tag.findFirst({ where: { slug } })
        if (retry) tagIds.push(retry.id)
      }
    }
  }
  return Array.from(new Set(tagIds))
}

export async function deleteArticle(id: string) {
  // Need to fetch article first to get info for file deletion
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      categories: {
        include: { parent: true }
      }
    }
  })

  if (article) {
    // Delete files for all categories
    for (const category of article.categories) {
      await deleteArticleFile(
        article.title, 
        category.name, 
        category.parent?.name
      )
    }
  }

  await prisma.article.delete({
    where: { id },
  })

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateArticle(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const categoryIds = (formData.get('categoryIds') as string)?.split(',').filter(Boolean) || []
  const content = formData.get('content') as string
  const court_area = formData.get('court_area') as CourtArea
  const difficulty = formData.get('difficulty') as Difficulty
  const video_url = formData.get('video_url') as string
  const tagsString = formData.get('tags') as string

  if (!title || categoryIds.length === 0) {
    throw new Error('Missing required fields: Title and at least one Category are required.')
  }

  // Ensure content is at least an empty string if missing
  const safeContent = content || ''

  const tagIds = await processTags(tagsString || '')

  // Get old article to clean up old files if categories changed
  const oldArticle = await prisma.article.findUnique({
    where: { id },
    include: { categories: { include: { parent: true } } }
  })
  
  if (oldArticle) {
    for (const cat of oldArticle.categories) {
       await deleteArticleFile(oldArticle.title, cat.name, cat.parent?.name)
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      categories: {
        set: [], // Clear existing
        connect: categoryIds.map(id => ({ id })) // Connect new
      },
      content: safeContent,
      court_area: court_area || null,
      difficulty: difficulty || null,
      video_url: video_url || null,
      tags: {
        set: [], // Clear existing relations
        connect: tagIds.map(id => ({ id })) // Connect new set
      }
    },
    include: { categories: true }
  })

  revalidatePath('/')
  revalidatePath('/admin')
  // Revalidate all new category pages
  article.categories.forEach(c => revalidatePath(`/category/${c.id}`))
  revalidatePath(`/article/${article.id}`)
  
  // Sync to file system (will write to all category folders)
  await syncArticleToMarkdown(article.id)
  
  redirect(`/article/${article.id}`)
}

export async function createArticle(formData: FormData) {
  const title = formData.get('title') as string
  const categoryIds = (formData.get('categoryIds') as string)?.split(',').filter(Boolean) || []
  const content = formData.get('content') as string
  const court_area = formData.get('court_area') as CourtArea
  const difficulty = formData.get('difficulty') as Difficulty
  const video_url = formData.get('video_url') as string
  const tagsString = formData.get('tags') as string

  if (!title || categoryIds.length === 0) {
    throw new Error('Missing required fields: Title and at least one Category are required.')
  }

  // Ensure content is at least an empty string if missing
  const safeContent = content || ''

  const tagIds = await processTags(tagsString || '')

  const article = await prisma.article.create({
    data: {
      title,
      categories: {
        connect: categoryIds.map(id => ({ id }))
      },
      content: safeContent,
      court_area: court_area || null,
      difficulty: difficulty || null,
      video_url: video_url || null,
      tags: {
        connect: tagIds.map(id => ({ id }))
      }
    },
    include: { categories: true }
  })

  revalidatePath('/')
  article.categories.forEach(c => revalidatePath(`/category/${c.id}`))
  
  // Sync to file system
  await syncArticleToMarkdown(article.id)

  redirect(`/article/${article.id}`)
}
