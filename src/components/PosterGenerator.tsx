'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const templates = [
  { id: 'classic', name: '经典模板' },
  { id: 'minimal', name: '极简模板' },
]

const WIDTH = 1080
const HEIGHT = 1440

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export default function PosterGenerator({
  name,
  url,
  type,
  defaultTemplate,
}: {
  name: string
  url: string
  type: 'image' | 'video' | 'other'
  defaultTemplate?: string
}) {
  const initialTemplate = templates.find((t) => t.id === defaultTemplate)?.id || templates[0].id
  const [template, setTemplate] = useState(initialTemplate)
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const drawPoster = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = template === 'minimal' ? '#0f172a' : '#111827'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const imageArea = { x: 80, y: 140, w: WIDTH - 160, h: 820 }

    if (type === 'image') {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = url
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      const scale = Math.max(imageArea.w / img.width, imageArea.h / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      const dx = imageArea.x + (imageArea.w - drawW) / 2
      const dy = imageArea.y + (imageArea.h - drawH) / 2
      ctx.save()
      roundRect(ctx, imageArea.x, imageArea.y, imageArea.w, imageArea.h, 24)
      ctx.clip()
      ctx.drawImage(img, dx, dy, drawW, drawH)
      ctx.restore()
    } else {
      ctx.fillStyle = '#1f2937'
      roundRect(ctx, imageArea.x, imageArea.y, imageArea.w, imageArea.h, 24)
      ctx.fill()
      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 64px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('视频内容', WIDTH / 2, imageArea.y + imageArea.h / 2)
    }

    ctx.fillStyle = '#f8fafc'
    ctx.textAlign = 'left'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText('斛教练 AI乒羽馆', 80, 1040)
    ctx.font = '32px sans-serif'
    ctx.fillStyle = '#cbd5f5'
    ctx.fillText('在球场成为时间的朋友', 80, 1105)
    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('羽拨心弦 · 文艺记录球友日常', 80, 1165)

    if (template === 'classic') {
      ctx.fillStyle = '#2563eb'
      roundRect(ctx, 80, 1188, 180, 6, 3)
      ctx.fill()
    } else {
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 2
      roundRect(ctx, 60, 120, WIDTH - 120, HEIGHT - 200, 28)
      ctx.stroke()
    }

    return canvas.toDataURL('image/png')
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const dataUrl = await drawPoster()
      setPosterUrl(dataUrl)
    } catch {
      setPosterUrl('')
    } finally {
      setLoading(false)
    }
  }

  const handleSharePoster = async () => {
    if (!posterUrl) return
    try {
      const blob = await (await fetch(posterUrl)).blob()
      const file = new File([blob], 'poster.png', { type: 'image/png' })
      if (navigator.share && (navigator as any).canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '斛教练 AI乒羽馆 海报' })
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="text-sm font-medium">分享海报</div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? '生成中...' : '生成海报'}
        </Button>
        {posterUrl && (
          <Button variant="outline" onClick={handleSharePoster}>
            分享海报
          </Button>
        )}
        {posterUrl && (
          <a
            href={posterUrl}
            download={`poster-${encodeURIComponent(name)}.png`}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            下载海报
          </a>
        )}
      </div>
      {posterUrl && (
        <img src={posterUrl} alt="分享海报" className="w-full rounded-lg border" />
      )}
    </div>
  )
}
