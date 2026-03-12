'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { appendVideoChannelItem } from '@/app/actions'
import { Button } from '@/components/ui/button'

export default function VideoChannelQuickAdd() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [cover, setCover] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const uploadFile = async (file: File, endpoint = '/api/upload') => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(endpoint, {
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

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fileUrl = await uploadFile(file)
      setUrl(fileUrl)
    } catch (err: any) {
      setError(err?.message || '上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fileUrl = await uploadFile(file, '/api/social-upload')
      setCover(fileUrl)
    } catch (err: any) {
      setError(err?.message || '上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) {
      setError('请填写标题和链接')
      return
    }
    setError('')
    startTransition(async () => {
      try {
        await appendVideoChannelItem(title.trim(), url.trim(), cover.trim() || undefined)
        setTitle('')
        setUrl('')
        setCover('')
        router.refresh()
      } catch (err: any) {
        setError(err?.message || '保存失败')
      }
    })
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="text-sm font-medium">上传视频号内容</div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="内容链接（可直接上传视频生成）"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="封面图链接（可选）"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            上传视频
            <input type="file" accept="video/*" onChange={handleUploadVideo} className="text-xs" />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            上传封面
            <input type="file" accept="image/*" onChange={handleUploadCover} className="text-xs" />
          </label>
        </div>
      </div>
      {uploading && <div className="text-xs text-muted-foreground">上传中...</div>}
      {error && <div className="text-xs text-destructive">{error}</div>}
      <Button onClick={handleAdd} disabled={isPending || uploading}>
        添加到视频号内容
      </Button>
      <div className="text-xs text-muted-foreground">添加后会显示在前台「视频号内容」列表中。</div>
    </div>
  )
}
