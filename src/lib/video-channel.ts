import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export type VideoChannelItem = {
  title: string
  url: string
  cover?: string
}

export type VideoChannelConfig = {
  name: string
  followUrl?: string
  qrImageUrl?: string
  items: VideoChannelItem[]
}

const defaultConfig: VideoChannelConfig = {
  name: '羽拨心弦',
  followUrl: '',
  qrImageUrl: '',
  items: [],
}

const getConfigPath = () => path.join(process.cwd(), 'data', 'video-channel.json')

export async function readVideoChannelConfig(): Promise<VideoChannelConfig> {
  try {
    const configPath = getConfigPath()
    if (!existsSync(configPath)) return defaultConfig
    const raw = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw || '{}')
    return {
      ...defaultConfig,
      ...parsed,
      items: Array.isArray(parsed?.items) ? parsed.items : [],
    }
  } catch (error) {
    console.error('Failed to read video channel config', error)
    return defaultConfig
  }
}

export async function writeVideoChannelConfig(config: VideoChannelConfig) {
  const configPath = getConfigPath()
  const dir = path.dirname(configPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
}
