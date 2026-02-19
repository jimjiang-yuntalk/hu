"use client"

import { useEffect, useState } from "react"

export default function UserSettingsPage() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const saved = window.localStorage.getItem("userSettings.imageUrl")
    if (saved) setImageUrl(saved)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "上传失败")
      }

      const data = await res.json()
      const url = data?.url as string
      if (!url) throw new Error("未返回图片地址")

      setImageUrl(url)
      window.localStorage.setItem("userSettings.imageUrl", url)
    } catch (err: any) {
      setError(err?.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用户设置</h1>
        <p className="text-muted-foreground mt-2">上传并保存你的头像/图片，会在下方显示。</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">上传图片</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:opacity-90"
        />
        {uploading && <p className="text-sm text-muted-foreground">上传中...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">已保存图片</h2>
        {imageUrl ? (
          <div className="rounded-lg border p-4 bg-card">
            <img src={imageUrl} alt="用户上传图片" className="max-w-full h-auto rounded-md" />
            <p className="text-xs text-muted-foreground mt-2">{imageUrl}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无已保存图片。</p>
        )}
      </div>
    </div>
  )
}
