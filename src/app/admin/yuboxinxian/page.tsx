"use client"

import { useEffect, useState, useTransition } from "react"
import { deleteUploadFile } from "@/app/actions"

interface VideoChannelItem {
  title: string
  url: string
  cover?: string
}

interface VideoChannelConfig {
  name: string
  followUrl?: string
  qrImageUrl?: string
  items: VideoChannelItem[]
}

export default function AdminYuBoXinXianPage() {
  const [channel, setChannel] = useState<VideoChannelConfig | null>(null)
  const [socialConfig, setSocialConfig] = useState<any>(null)
  const [uploads, setUploads] = useState<any[]>([])
  const [savingChannel, setSavingChannel] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchChannel = async () => {
    try {
      const res = await fetch("/api/video-channel")
      const data = await res.json()
      setChannel(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchSocial = async () => {
    try {
      const res = await fetch("/api/social-config")
      const data = await res.json()
      setSocialConfig(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/uploads")
      const data = await res.json()
      setUploads(data?.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveChannel = async () => {
    if (!channel) return
    setSavingChannel(true)
    setSaveMessage(null)
    try {
      const res = await fetch("/api/video-channel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channel),
      })
      if (!res.ok) throw new Error("保存失败")
      setSaveMessage("视频号内容已保存")
      await fetchChannel()
    } catch (err) {
      console.error(err)
      setSaveMessage("视频号内容保存失败")
    } finally {
      setSavingChannel(false)
    }
  }

  const uploadFile = async (file: File, endpoint = "/api/upload") => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "上传失败")
    }
    const data = await res.json()
    return data?.url as string
  }

  const handleUploadCover = async (index: number, file: File) => {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadFile(file, "/api/social-upload")
      updateChannelItem(index, { cover: url })
    } catch (err: any) {
      setError(err?.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

  const handleUploadSocialQr = async (key: "videoQrUrl" | "mpQrUrl", file: File) => {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadFile(file, "/api/social-upload")
      setSocialConfig({ ...socialConfig, [key]: url })
    } catch (err: any) {
      setError(err?.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

    const handleUploadWork = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      await uploadFile(file)
      await fetchUploads()
    } catch (err: any) {
      setError(err?.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteUpload = (filename: string) => {
    if (!confirm("确定要删除这个文件吗？")) return
    startTransition(async () => {
      try {
        await deleteUploadFile(filename)
        await fetchUploads()
      } catch (err) {
        console.error(err)
        setError("删除失败")
      }
    })
  }

  const handleSaveSocial = async () => {
    if (!socialConfig) return
    setSavingSocial(true)
    setSaveMessage(null)
    try {
      const res = await fetch("/api/social-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialConfig),
      })
      if (!res.ok) throw new Error("保存失败")
      setSaveMessage("二维码设置已保存")
      await fetchSocial()
    } catch (err) {
      console.error(err)
      setSaveMessage("二维码设置保存失败")
    } finally {
      setSavingSocial(false)
    }
  }

  const updateChannelItem = (index: number, patch: Partial<VideoChannelItem>) => {
    if (!channel) return
    const next = [...(channel.items || [])]
    next[index] = { ...next[index], ...patch }
    setChannel({ ...channel, items: next })
  }

  const addChannelItem = () => {
    if (!channel) return
    const next = [...(channel.items || []), { title: "", url: "", cover: "" }]
    setChannel({ ...channel, items: next })
  }

  const removeChannelItem = (index: number) => {
    if (!channel) return
    const next = (channel.items || []).filter((_, i) => i !== index)
    setChannel({ ...channel, items: next })
  }

  useEffect(() => {
    fetchChannel()
    fetchSocial()
    fetchUploads()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">羽拨心弦运维</h1>
        <p className="text-muted-foreground mt-2">管理二维码设置与视频号内容。</p>
      </div>

      {saveMessage && (
        <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">{saveMessage}</div>
      )}
      {error && (
        <div className="rounded-lg border bg-card p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">二维码设置</h2>
          <button
            onClick={handleSaveSocial}
            className="text-sm text-primary hover:underline"
            disabled={savingSocial}
          >
            {savingSocial ? "保存中..." : "保存二维码设置"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm font-medium">视频号</div>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="视频号名称"
              value={socialConfig?.videoName || ""}
              onChange={(e) => setSocialConfig({ ...socialConfig, videoName: e.target.value })}
            />
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="视频号二维码图片 URL（如 /uploads/xxx.jpg）"
              value={socialConfig?.videoQrUrl || ""}
              onChange={(e) => setSocialConfig({ ...socialConfig, videoQrUrl: e.target.value })}
            />
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              上传二维码
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUploadSocialQr("videoQrUrl", file)
                  if (e.target) e.target.value = ""
                }}
                className="text-xs"
              />
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="视频号跳转链接（可空）"
              value={socialConfig?.videoFollowUrl || ""}
              onChange={(e) => setSocialConfig({ ...socialConfig, videoFollowUrl: e.target.value })}
            />
            {socialConfig?.videoQrUrl ? (
              <img src={socialConfig.videoQrUrl} alt="视频号二维码" className="w-28 h-28 rounded border object-cover" />
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">公众号</div>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="公众号名称"
              value={socialConfig?.mpName || ""}
              onChange={(e) => setSocialConfig({ ...socialConfig, mpName: e.target.value })}
            />
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="公众号二维码图片 URL（如 /uploads/xxx.jpg）"
              value={socialConfig?.mpQrUrl || ""}
              onChange={(e) => setSocialConfig({ ...socialConfig, mpQrUrl: e.target.value })}
            />
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              上传二维码
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUploadSocialQr("mpQrUrl", file)
                  if (e.target) e.target.value = ""
                }}
                className="text-xs"
              />
            </label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="公众号跳转链接（可空）"
              value={socialConfig?.mpFollowUrl || ""}
              onChange={(e) => setSocialConfig({ ...socialConfig, mpFollowUrl: e.target.value })}
            />
            {socialConfig?.mpQrUrl ? (
              <img src={socialConfig.mpQrUrl} alt="公众号二维码" className="w-28 h-28 rounded border object-cover" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">视频号内容运维</h2>
          <div className="flex items-center gap-3">
            <button onClick={addChannelItem} className="text-sm text-muted-foreground hover:text-primary">
              新增一条
            </button>
            <button
              onClick={handleSaveChannel}
              className="text-sm text-primary hover:underline"
              disabled={savingChannel}
            >
              {savingChannel ? "保存中..." : "保存内容"}
            </button>
          </div>
        </div>

        {!channel?.items || channel.items.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无内容。</div>
        ) : (
          <div className="space-y-4">
            {channel.items.map((item, idx) => (
              <div key={`${item.url}-${idx}`} className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">内容 #{idx + 1}</div>
                  <button
                    onClick={() => removeChannelItem(idx)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    删除
                  </button>
                </div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="标题"
                  value={item.title || ""}
                  onChange={(e) => updateChannelItem(idx, { title: e.target.value })}
                />
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="文章链接（https://...）"
                  value={item.url || ""}
                  onChange={(e) => updateChannelItem(idx, { url: e.target.value })}
                />
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="封面图 URL（如 /uploads/xxx.jpg）"
                  value={item.cover || ""}
                  onChange={(e) => updateChannelItem(idx, { cover: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  上传封面
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadCover(idx, file)
                      if (e.target) e.target.value = ""
                    }}
                    className="text-xs"
                  />
                </label>
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className="w-full max-w-sm rounded border object-cover" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">上传作品列表</h2>
          <button
            onClick={fetchUploads}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            刷新
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">新增上传作品</div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUploadWork(file)
              if (e.target) e.target.value = ""
            }}
            className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:opacity-90"
          />
          {uploading && <div className="text-xs text-muted-foreground">上传中...</div>}
        </div>

        {uploads.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无上传内容</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((item: any) => (
              <div key={item.url} className="rounded-xl border bg-card overflow-hidden">
                <a href={`/media/${encodeURIComponent(item.name)}`} className="block">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.name} className="h-44 w-full object-cover" />
                  ) : item.type === "video" ? (
                    <video src={item.url} className="h-44 w-full object-cover" controls preload="metadata" />
                  ) : (
                    <div className="h-44 w-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                      文件预览不可用
                    </div>
                  )}
                </a>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="flex justify-end">
                    <button
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      disabled={isPending || uploading}
                      onClick={() => handleDeleteUpload(item.name)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
