"use client"

import { useState } from "react"

type Source = {
  type: "article" | "markdown"
  title: string
  snippet: string
  link: string
  score: number
}

export default function ChatSearch() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAsk = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setAnswer("")
    setSources([])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "检索失败")
      }

      const data = await res.json()
      setAnswer(data?.answer || "")
      setSources(data?.sources || [])
    } catch (err: any) {
      setError(err?.message || "检索失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border bg-white/70 dark:bg-card shadow-sm">
      <div className="px-6 pt-6 pb-4 border-b">
        <h2 className="text-xl font-semibold">Ask 斛教练 about 羽毛球知识库</h2>
        <p className="text-muted-foreground text-sm mt-1">输入问题，检索文章与 Markdown 知识库。</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {answer && (
          <div className="rounded-lg border p-4 bg-background text-sm whitespace-pre-wrap">
            {answer}
          </div>
        )}

        {sources.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">来源链接</h3>
            <ul className="space-y-1 text-sm">
              {sources.map((s, idx) => (
                <li key={idx}>
                  <a href={s.link} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="rounded-2xl border bg-muted/40 p-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about 羽毛球知识库..."
            className="min-h-[72px] w-full resize-none bg-transparent text-sm focus:outline-none"
          />
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">仅检索知识库</div>
            <div className="flex items-center gap-3">
              {error && <span className="text-xs text-destructive">{error}</span>}
              <button
                onClick={handleAsk}
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                disabled={loading}
              >
                {loading ? "检索中..." : "发送"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
