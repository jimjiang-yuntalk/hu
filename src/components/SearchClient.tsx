"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const goToLoading = (q: string) => {
    router.push(`/qa/loading?q=${encodeURIComponent(q)}`)
    setLoading(false)
  }

  useEffect(() => {
    if (initialQuery) {
      goToLoading(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const onSearch = () => {
    if (!query.trim()) return
    const q = query.trim()
    setLoading(true)
    setError("")
    goToLoading(q)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-muted/40 p-4">
        <div className="text-sm text-muted-foreground mb-2">你的问题</div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch()
              }
            }}
            placeholder="输入你的问题..."
            className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={onSearch}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            disabled={loading}
          >
            {loading ? "正在跳转..." : "生成报告"}
          </button>
        </div>
        {error && <div className="text-xs text-destructive mt-2">{error}</div>}
        <div className="mt-3 text-xs text-muted-foreground">提交后将进入报告生成页面</div>
      </div>
    </div>
  )
}
