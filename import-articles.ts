import fs from "fs/promises"
import path from "path"
import { PrismaClient, CourtArea, Difficulty } from '@prisma/client'
import { slugify } from './src/lib/slug'

const prisma = new PrismaClient()

// Map category names to court areas
const getCourtArea = (categoryName: string): CourtArea => {
  const name = categoryName.toLowerCase()
  if (name.includes('网前') || name.includes('net')) return CourtArea.Net
  if (name.includes('中场') || name.includes('mid')) return CourtArea.Mid  
  if (name.includes('后场') || name.includes('rear')) return CourtArea.Rear
  return CourtArea.Full
}

// Map category names to difficulty levels
const getDifficulty = (articleTitle: string): Difficulty => {
  // For now, set all to beginner level
  return Difficulty.L1_Beginner
}

async function importArticles() {
  console.log('Starting article import from markdown files...')
  
  // Get all markdown files
  const kbRoot = path.join(process.cwd(), 'ybxy')
  const markdownFiles: string[] = []
  
  const walk = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        markdownFiles.push(fullPath)
      }
    }
  }
  
  await walk(kbRoot)
  console.log(`Found ${markdownFiles.length} markdown files`)
  
  // Clear existing articles
  await prisma.article.deleteMany()
  console.log('Cleared existing articles')
  
  // Process each markdown file
  let importedCount = 0
  for (const filePath of markdownFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Extract title from first # heading or filename
      let title = path.basename(filePath, '.md')
      const firstLine = content.split('\n')[0]
      if (firstLine.startsWith('# ')) {
        title = firstLine.substring(2).trim()
      }
      
      // Determine category from file path
      const relativePath = path.relative(kbRoot, filePath)
      const pathParts = relativePath.split(path.sep)
      
      // Skip root category files (they are just category descriptions)
      if (pathParts.length === 1) {
        continue
      }
      
      // Get category name (second level directory)
      const categoryName = pathParts[0].replace(/\s*\(.*\)/, '') // Remove English part
      const subCategoryName = pathParts.length > 2 ? pathParts[1].replace(/\s*\(.*\)/, '') : ''
      
      // Find or create categories
      let parentCategory = await prisma.category.findFirst({
        where: { name: { contains: categoryName } }
      })
      
      if (!parentCategory) {
        console.log(`Warning: Parent category not found for ${categoryName}`)
        continue
      }
      
      let childCategory = null
      if (subCategoryName) {
        childCategory = await prisma.category.findFirst({
          where: { 
            name: { contains: subCategoryName },
            parentId: parentCategory.id
          }
        })
      }
      
      if (!childCategory && subCategoryName) {
        console.log(`Warning: Child category not found for ${subCategoryName}`)
        continue
      }
      
      // Create article
      const article = await prisma.article.create({
        data: {
          title,
          content,
          court_area: getCourtArea(categoryName),
          difficulty: getDifficulty(title),
          categories: {
            connect: [{ id: childCategory?.id || parentCategory.id }]
          }
        }
      })
      
      importedCount++
      console.log(`Imported: ${title}`)
      
    } catch (error) {
      console.error(`Error importing ${filePath}:`, error)
    }
  }
  
  console.log(`Import completed. Total articles imported: ${importedCount}`)
}

async function main() {
  try {
    await importArticles()
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()