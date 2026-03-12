'use client'

import { useState, useTransition } from 'react'
import { updateSocialConfig } from '@/app/actions'
import { Button } from '@/components/ui/button'

type SocialConfig = {
  videoName: string
  videoQrUrl?: string
  videoFollowUrl?: string
  mpName: string
  mpQrUrl?: string
  mpFollowUrl?: string
}

export default function SocialQrConfig({ initial }: { initial: SocialConfig }) {
  const [videoName, setVideoName] = useState(initial.videoName || '')
  const [videoQrUrl, setVideoQrUrl] = useState(initial.videoQrUrl || '')
  const [videoFollowUrl, setVideoFollowUrl] = useState(initial.videoFollowUrl || '')
  const [mpName, setMpName] = useState(initial.mpName || '')
  const [mpQrUrl, setMpQrUrl] = useState(initial.mpQrUrl || '')
  const [mpFollowUrl, setMpFollowUrl] = useState(initial.mpFollowUrl || '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || '上传失败')
    }
    const data = await res.json()
    return data?.url as string
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const url = await uploadFile(file)
      setter(url)
    } catch (err: any) {
      setError(err?.message || '上传失败')
    } finally {
      e.target.value = ''
    }
  }

  const handleSave = () => {
    setError('')
    const formData = new FormData()
    formData.set('videoName', videoName)
    formData.set('videoQrUrl', videoQrUrl)
    formData.set('videoFollowUrl', videoFollowUrl)
    formData.set('mpName', mpName)
    formData.set('mpQrUrl', mpQrUrl)
    formData.set('mpFollowUrl', mpFollowUrl)

    startTransition(async () => {
      try {
        await updateSocialConfig(formData)
      } catch (err: any) {
        setError(err?.message || '保存失败')
      }
    })
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">二维码设置</h2>
        <p className="text-xs text-muted-foreground mt-1">用于前台展示视频号与公众号二维码。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">视频号</div>
          <input
            value={videoName}
            onChange={(e) => setVideoName(e.target.value)}
            placeholder="名称"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <input
            value={videoFollowUrl}
            onChange={(e) => setVideoFollowUrl(e.target.value)}
            placeholder="视频号主页链接"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              value={videoQrUrl}
              onChange={(e) => setVideoQrUrl(e.target.value)}
              placeholder="二维码图片链接"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
            />
            <label className="text-xs text-muted-foreground">
              上传
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, setVideoQrUrl)} className="text-xs" />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">公众号</div>
          <input
            value={mpName}
            onChange={(e) => setMpName(e.target.value)}
            placeholder="名称"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <input
            value={mpFollowUrl}
            onChange={(e) => setMpFollowUrl(e.target.value)}
            placeholder="公众号链接"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              value={mpQrUrl}
              onChange={(e) => setMpQrUrl(e.target.value)}
              placeholder="二维码图片链接"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
            />
            <label className="text-xs text-muted-foreground">
              上传
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, setMpQrUrl)} className="text-xs" />
            </label>
          </div>
        </div>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}

      <Button onClick={handleSave} disabled={isPending}>
        保存二维码
      </Button>
    </div>
  )
}
