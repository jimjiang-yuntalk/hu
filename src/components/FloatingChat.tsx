"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  const submit = () => {
    if (!query.trim()) return
    const q = query.trim()
    setOpen(false)
    setQuery("")
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-card shadow-xl p-4">
          <div className="text-sm font-medium mb-2">斛教练 · 智能问答</div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="输入你的问题... (Ctrl/⌘ + Enter 发送)"
            className="min-h-[88px] w-full resize-none rounded-lg border bg-background p-2 text-sm focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              关闭
            </button>
            <button
              onClick={submit}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              发送
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 text-sm font-medium hover:opacity-90"
        >
          问斛教练
        </button>
      )}
    </div>
  )
}
