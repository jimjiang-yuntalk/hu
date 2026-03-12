import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export type SocialConfig = {
  videoName: string
  videoQrUrl?: string
  videoFollowUrl?: string
  mpName: string
  mpQrUrl?: string
  mpFollowUrl?: string
}

const defaultConfig: SocialConfig = {
  videoName: '羽拨心弦视频号',
  videoQrUrl: '',
  videoFollowUrl: '',
  mpName: '羽拨心弦公众号',
  mpQrUrl: '',
  mpFollowUrl: '',
}

const getConfigPath = () => path.join(process.cwd(), 'data', 'social-config.json')

export async function readSocialConfig(): Promise<SocialConfig> {
  try {
    const configPath = getConfigPath()
    if (!existsSync(configPath)) return defaultConfig
    const raw = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw || '{}')
    return {
      ...defaultConfig,
      ...parsed,
    }
  } catch (error) {
    console.error('Failed to read social config', error)
    return defaultConfig
  }
}

export async function writeSocialConfig(config: SocialConfig) {
  const configPath = getConfigPath()
  const dir = path.dirname(configPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
}
