import { listUploads } from '@/lib/uploads'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SharePanel from '@/components/SharePanel'
import SwipeNavigator from '@/components/SwipeNavigator'
import { readQuotes } from '@/lib/quotes'

export const dynamic = 'force-dynamic'

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const rawName = typeof name === 'string' ? decodeURIComponent(name) : ''
  if (!rawName) {
    notFound()
  }
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const [uploads, quotes] = await Promise.all([listUploads(), readQuotes()])
  const item = uploads.find((u) => u.name === rawName || u.name === safeName)

  if (!item) {
    notFound()
  }

  const index = uploads.findIndex((u) => u.name === item.name)
  const prevItem = index > 0 ? uploads[index - 1] : null
  const nextItem = index >= 0 && index < uploads.length - 1 ? uploads[index + 1] : null

  return (
    <SwipeNavigator
      prevHref={prevItem ? `/media/${encodeURIComponent(prevItem.name)}` : null}
      nextHref={nextItem ? `/media/${encodeURIComponent(nextItem.name)}` : null}
    >
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-muted/40 border-b">
          <div className="text-xs text-muted-foreground">斛教练 AI乒羽馆</div>
          <h1 className="text-2xl font-bold mt-1">在球场成为时间的朋友</h1>
        </div>
        <div className="p-6">
          {item.type === 'image' ? (
            <img src={item.url} alt={item.name} className="w-full rounded-lg" />
          ) : item.type === 'video' ? (
            <video src={item.url} controls className="w-full rounded-lg" />
          ) : (
            <div className="h-64 w-full flex items-center justify-center bg-muted text-muted-foreground text-sm rounded-lg">
              文件预览不可用
            </div>
          )}
          <div className="mt-4 text-sm text-muted-foreground break-all">{item.name}</div>
          <div className="mt-2">
            <Link href={item.url} target="_blank" className="text-xs text-muted-foreground hover:text-primary">
              打开原始链接
            </Link>
          </div>
        </div>
      </div>

      <SharePanel
        sharePath={`/media/${encodeURIComponent(item.name)}`}
        quotes={quotes.map((q) => ({ id: q.id, content: q.content, author: q.author || '' }))}
      />

      <div>
        <Link href="/user-settings" className="text-sm text-muted-foreground hover:text-primary">
          返回羽拨心弦
        </Link>
      </div>
    </div>
    </SwipeNavigator>
  )
}
