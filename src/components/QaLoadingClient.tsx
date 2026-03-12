"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function QaLoadingClient({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [query, setQuery] = useState(initialQuery)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return

    let currentQuery = query
    if (!currentQuery || !currentQuery.trim()) {
      if (typeof window !== "undefined") {
        const fromUrl = new URLSearchParams(window.location.search).get("q") || ""
        if (fromUrl) {
          setQuery(fromUrl)
          return
        }
      }
      setError("缺少问题")
      return
    }

    hasRun.current = true

    const run = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: currentQuery }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || "生成失败")
        }
        const data = await res.json()
        if (data?.qaId) {
          router.replace(`/qa/${data.qaId}`)
          return
        }
        throw new Error("生成失败，请稍后重试")
      } catch (err: any) {
        setError(err?.message || "生成失败，请稍后重试")
      }
    }

    run()
  }, [query, router])

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-2xl border bg-card p-6 text-center space-y-4">
          <div className="text-lg font-semibold text-foreground">生成失败</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>返回首页</Button>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">文档生成中...</div>
            <div className="text-sm text-muted-foreground">正在整理你的问题与资料</div>
          </div>
          <Loader2 className="ml-auto h-5 w-5 animate-spin text-primary" />
        </div>

        {query && (
          <div className="mt-4 text-sm text-muted-foreground">
            你的问题：<span className="text-foreground font-medium">{query}</span>
          </div>
        )}

        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 rounded bg-muted w-1/3" />
          <div className="h-3 rounded bg-muted w-full" />
          <div className="h-3 rounded bg-muted w-5/6" />
          <div className="h-3 rounded bg-muted w-4/6" />
          <div className="h-3 rounded bg-muted w-2/3" />
        </div>
      </div>
    </div>
  )
}
