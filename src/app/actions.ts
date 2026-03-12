'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CourtArea, Difficulty } from '@prisma/client'
import { syncArticleToMarkdown, deleteArticleFile } from '@/lib/sync-files'
import { readVideoChannelConfig, writeVideoChannelConfig } from '@/lib/video-channel'
import { writeSocialConfig } from '@/lib/social-config'
import { readShareTemplates, writeShareTemplates } from '@/lib/share-templates'
import { readQuotes, writeQuotes } from '@/lib/quotes'
import fs from 'fs/promises'
import path from 'path'

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

export async function deleteQaHistory(id: string) {
  await prisma.qaHistory.delete({ where: { id } })
  revalidatePath('/qa-history')
  revalidatePath('/admin/qa')
  revalidatePath('/')
}

export async function deleteUploadFile(filename: string) {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename')
  }
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const filePath = path.join(uploadDir, filename)
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(path.resolve(uploadDir))) {
    throw new Error('Invalid path')
  }
  await fs.unlink(resolved)
  revalidatePath('/user-settings')
  revalidatePath('/admin/uploads')
  revalidatePath('/')
}

export async function renameUploadFile(oldName: string, newName: string) {
  if (!oldName || oldName.includes('..') || oldName.includes('/') || oldName.includes('\\')) {
    throw new Error('Invalid filename')
  }
  const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_')

  const oldSafe = sanitize(oldName)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const oldPath = path.join(uploadDir, oldSafe)
  const oldResolved = path.resolve(oldPath)
  if (!oldResolved.startsWith(path.resolve(uploadDir))) {
    throw new Error('Invalid path')
  }

  const ext = path.extname(oldSafe)
  let nextName = sanitize(newName)
  if (!nextName) throw new Error('文件名不能为空')
  if (!path.extname(nextName)) {
    nextName = `${nextName}${ext}`
  }
  if (path.extname(nextName).toLowerCase() !== ext.toLowerCase()) {
    nextName = `${path.basename(nextName, path.extname(nextName))}${ext}`
  }

  const newPath = path.join(uploadDir, nextName)
  const newResolved = path.resolve(newPath)
  if (!newResolved.startsWith(path.resolve(uploadDir))) {
    throw new Error('Invalid path')
  }

  if (oldResolved === newResolved) return

  await fs.rename(oldResolved, newResolved)
  revalidatePath('/user-settings')
  revalidatePath('/admin/uploads')
  revalidatePath('/')
}

export async function setShareTemplate(filename: string, template: string) {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename')
  }
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const allowed = new Set(['classic', 'minimal'])
  if (!allowed.has(template)) {
    throw new Error('Invalid template')
  }

  const map = await readShareTemplates()
  map[safeName] = template
  await writeShareTemplates(map)

  revalidatePath('/media')
  revalidatePath('/admin/uploads')
}

export async function addQuote(formData: FormData) {
  const content = ((formData.get('content') as string) || '').trim()
  const author = ((formData.get('author') as string) || '').trim()

  if (!content) throw new Error('金句内容不能为空')

  const list = await readQuotes()
  list.unshift({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    content,
    author,
    createdAt: new Date().toISOString(),
  })

  await writeQuotes(list)
  revalidatePath('/quotes')
  revalidatePath('/admin/quotes')
  revalidatePath('/media')
  revalidatePath('/')
}

export async function deleteQuote(id: string) {
  if (!id) throw new Error('Invalid id')
  const list = await readQuotes()
  const next = list.filter((q) => q.id !== id)
  await writeQuotes(next)
  revalidatePath('/quotes')
  revalidatePath('/admin/quotes')
  revalidatePath('/media')
  revalidatePath('/')
}

export async function appendVideoChannelItem(title: string, url: string, cover?: string) {
  const safeTitle = title?.trim()
  const safeUrl = url?.trim()
  if (!safeTitle || !safeUrl) {
    throw new Error('标题和链接不能为空')
  }

  const config = await readVideoChannelConfig()
  const items = [{ title: safeTitle, url: safeUrl, cover }, ...(config.items || [])]

  await writeVideoChannelConfig({
    ...config,
    items,
  })

  revalidatePath('/user-settings')
  revalidatePath('/admin/uploads')
  revalidatePath('/')
}

export async function updateSocialConfig(formData: FormData) {
  const videoName = ((formData.get('videoName') as string) || '').trim() || '羽拨心弦视频号'
  const videoQrUrl = ((formData.get('videoQrUrl') as string) || '').trim()
  const videoFollowUrl = ((formData.get('videoFollowUrl') as string) || '').trim()
  const mpName = ((formData.get('mpName') as string) || '').trim() || '羽拨心弦公众号'
  const mpQrUrl = ((formData.get('mpQrUrl') as string) || '').trim()
  const mpFollowUrl = ((formData.get('mpFollowUrl') as string) || '').trim()

  await writeSocialConfig({
    videoName,
    videoQrUrl,
    videoFollowUrl,
    mpName,
    mpQrUrl,
    mpFollowUrl,
  })

  revalidatePath('/user-settings')
  revalidatePath('/admin/uploads')
}

export async function updateVideoChannelConfig(formData: FormData) {
  const name = ((formData.get('name') as string) || '').trim() || '羽拨心弦'
  const followUrl = ((formData.get('followUrl') as string) || '').trim()
  const qrImageUrl = ((formData.get('qrImageUrl') as string) || '').trim()
  const itemsText = (formData.get('items') as string) || ''

  const items = itemsText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[|｜]/).map(p => p.trim()).filter(Boolean)
      if (parts.length < 2) return null
      const [title, url, cover] = parts as [string, string, string?]
      return {
        title,
        url,
        cover,
      }
    })
    .filter((item) => item !== null) as { title: string; url: string; cover?: string }[]

  await writeVideoChannelConfig({
    name,
    followUrl,
    qrImageUrl,
    items,
  })

  revalidatePath('/user-settings')
  revalidatePath('/admin/uploads')
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
