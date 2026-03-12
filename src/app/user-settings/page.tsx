"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type QuoteItem = {
  id: string
  content: string
  author?: string
}

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

export default function UserSettingsPage() {
  const [channel, setChannel] = useState<VideoChannelConfig | null>(null)
  const [socialConfig, setSocialConfig] = useState<any>(null)
  const [uploads, setUploads] = useState<any[]>([])
  const [quotes, setQuotes] = useState<QuoteItem[]>([])

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

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes')
      const data = await res.json()
      setQuotes(data?.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchChannel()
    fetchSocial()
    fetchUploads()
    fetchQuotes()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">羽拨心弦</h1>
        <p className="text-muted-foreground mt-2">球友日常</p>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-lg font-semibold">视频号内容</h2>
        {!channel?.items || channel.items.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无内容。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channel.items.map((item, idx) => (
              <div key={`${item.url}-${idx}`} className="rounded-xl border bg-card overflow-hidden">
                <a href={item.url} target="_blank" rel="noreferrer" className="block">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                      暂无封面
                    </div>
                  )}
                </a>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-medium line-clamp-2">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-lg font-semibold">精彩瞬间</h2>
        {uploads.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无上传内容</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((item: any) => (
              <Link key={item.url} href={`/media/${encodeURIComponent(item.name)}`} className="rounded-xl border bg-card overflow-hidden">
                {item.type === "image" ? (
                  <img src={item.url} alt={item.name} className="h-44 w-full object-cover" />
                ) : item.type === "video" ? (
                  <video src={item.url} className="h-44 w-full object-cover" controls preload="metadata" />
                ) : (
                  <div className="h-44 w-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                    文件预览不可用
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">羽坛金句</h2>
          <Link href="/quotes" className="text-sm text-muted-foreground hover:text-primary">查看全部</Link>
        </div>
        {quotes.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无金句</div>
        ) : (
          <div className="space-y-2">
            {quotes.slice(0, 3).map((q) => (
              <div key={q.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
                “{q.content}”
                {q.author && <div className="mt-1 text-xs text-muted-foreground">—— {q.author}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-lg font-semibold">关注</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-4">
            <div className="w-28 h-28 rounded-lg border bg-muted/40 flex items-center justify-center overflow-hidden">
              {socialConfig?.videoQrUrl ? (
                <img src={socialConfig.videoQrUrl} alt="视频号二维码" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">暂无二维码</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{socialConfig?.videoName || "羽拨心弦视频号"}</div>

            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-4">
            <div className="w-28 h-28 rounded-lg border bg-muted/40 flex items-center justify-center overflow-hidden">
              {socialConfig?.mpQrUrl ? (
                <img src={socialConfig.mpQrUrl} alt="公众号二维码" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">暂无二维码</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{socialConfig?.mpName || "羽拨心弦公众号"}</div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
