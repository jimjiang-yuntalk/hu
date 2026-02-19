import fs from 'fs/promises'
import path from 'path'
import TurndownService from 'turndown'
import { prisma } from './prisma'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})

const BASE_DIR = path.join(process.cwd(), 'ybxy')

/**
 * Sanitizes a string to be safe for file paths
 */
function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim()
}

/**
 * Syncs a single article to a Markdown file in the ybxy directory
 */
export async function syncArticleToMarkdown(articleId: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        categories: {
          include: {
            parent: true
          }
        }
      }
    })

    if (!article) return

    // 1. Determine Directory Paths for ALL categories
    for (const category of article.categories) {
      let dirPath = BASE_DIR
      
      if (category.parent) {
        dirPath = path.join(dirPath, sanitizeFileName(category.parent.name), sanitizeFileName(category.name))
      } else {
        dirPath = path.join(dirPath, sanitizeFileName(category.name))
      }

      // 2. Create Directory
      await fs.mkdir(dirPath, { recursive: true })

      // 3. Convert Content to Markdown
      // Add Frontmatter (Metadata)
      const markdownContent = `---
title: ${article.title}
categories: [${article.categories.map(c => c.name).join(', ')}]
tags: [${(await prisma.tag.findMany({ where: { articles: { some: { id: article.id } } } })).map(t => t.name).join(', ')}]
difficulty: ${article.difficulty || 'N/A'}
court_area: ${article.court_area || 'N/A'}
updated_at: ${article.updatedAt.toISOString()}
---

${turndownService.turndown(article.content || '')}
`

      // 4. Write File
      const fileName = `${sanitizeFileName(article.title)}.md`
      const filePath = path.join(dirPath, fileName)
      
      await fs.writeFile(filePath, markdownContent, 'utf-8')
      console.log(`Synced article to: ${filePath}`)
    }

  } catch (error) {
    console.error('Failed to sync article to markdown:', error)
  }
}

/**
 * Deletes the markdown file for an article
 * Note: We need the article data BEFORE deletion to know the path, 
 * or we have to search for the file. Searching is safer if DB record is gone.
 */
export async function deleteArticleFile(title: string, categoryName: string, parentCategoryName?: string | null) {
  try {
    let dirPath = BASE_DIR
    if (parentCategoryName) {
      dirPath = path.join(dirPath, sanitizeFileName(parentCategoryName), sanitizeFileName(categoryName))
    } else {
      dirPath = path.join(dirPath, sanitizeFileName(categoryName))
    }

    const fileName = `${sanitizeFileName(title)}.md`
    const filePath = path.join(dirPath, fileName)

    await fs.unlink(filePath)
    console.log(`Deleted article file: ${filePath}`)
    
    // Optional: Clean up empty directories
    // await rmdirIfEmpty(dirPath)
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to delete article file:', error)
    }
  }
}
