"use client"

import { useEffect, useState } from "react"

export default function UserSettingsPage() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const savedImage = window.localStorage.getItem("userSettings.imageUrl")
    const savedVideo = window.localStorage.getItem("userSettings.videoUrl")
    if (savedImage) setImageUrl(savedImage)
    if (savedVideo) setVideoUrl(savedVideo)
  }, [])

  const uploadFile = async (file: File) => {
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
    if (!url) throw new Error("未返回文件地址")
    return url
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    try {
      const url = await uploadFile(file)
      setImageUrl(url)
      window.localStorage.setItem("userSettings.imageUrl", url)
    } catch (err: any) {
      setError(err?.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    try {
      const url = await uploadFile(file)
      setVideoUrl(url)
      window.localStorage.setItem("userSettings.videoUrl", url)
    } catch (err: any) {
      setError(err?.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用户上传</h1>
        <p className="text-muted-foreground mt-2">上传并保存图片或视频，会在下方显示并可播放。</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">上传图片</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:opacity-90"
        />
        <label className="block text-sm font-medium mt-4">上传视频</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
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

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">已保存视频</h2>
        {videoUrl ? (
          <div className="rounded-lg border p-4 bg-card">
            <video src={videoUrl} controls className="w-full rounded-md" />
            <p className="text-xs text-muted-foreground mt-2">{videoUrl}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无已保存视频。</p>
        )}
      </div>
    </div>
  )
}
