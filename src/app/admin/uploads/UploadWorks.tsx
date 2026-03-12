'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadWorks() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

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

    return res.json()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      await uploadFile(file)
      router.refresh()
      e.target.value = ''
    } catch (err: any) {
      setError(err?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="text-sm font-medium">上传作品（图片或视频）</div>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:opacity-90"
      />
      {uploading && <p className="text-sm text-muted-foreground">上传中...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
