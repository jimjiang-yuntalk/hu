import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export async function generateThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
  // Ensure output directory exists
  await fs.mkdir(path.dirname(thumbnailPath), { recursive: true })
  
  // Generate thumbnail at 1 second mark
  const command = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -f image2 "${thumbnailPath}" -y`
  
  try {
    await execAsync(command)
    console.log(`Generated thumbnail: ${thumbnailPath}`)
  } catch (error) {
    console.error(`Failed to generate thumbnail for ${videoPath}:`, error)
    // Create a fallback placeholder if thumbnail generation fails
    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'video-placeholder.jpg')
    if (await fileExists(placeholderPath)) {
      await fs.copyFile(placeholderPath, thumbnailPath)
    }
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}