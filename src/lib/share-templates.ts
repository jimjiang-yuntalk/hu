import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export type ShareTemplateMap = Record<string, string>

const getConfigPath = () => path.join(process.cwd(), 'data', 'share-templates.json')

export async function readShareTemplates(): Promise<ShareTemplateMap> {
  try {
    const configPath = getConfigPath()
    if (!existsSync(configPath)) return {}
    const raw = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw || '{}')
    if (parsed && typeof parsed === 'object') return parsed as ShareTemplateMap
    return {}
  } catch (error) {
    console.error('Failed to read share templates', error)
    return {}
  }
}

export async function writeShareTemplates(map: ShareTemplateMap) {
  const configPath = getConfigPath()
  const dir = path.dirname(configPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(configPath, JSON.stringify(map, null, 2), 'utf-8')
}
