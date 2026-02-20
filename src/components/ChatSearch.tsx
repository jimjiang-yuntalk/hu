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
    <section className="space-y-4 rounded-xl border p-6 bg-card">
      <div>
        <h2 className="text-2xl font-bold">知识库检索</h2>
        <p className="text-muted-foreground text-sm mt-1">输入问题，检索文章与 Markdown 知识库。</p>
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例如：网前收搓的关键要点是什么？"
          className="min-h-[90px] w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleAsk}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            disabled={loading}
          >
            {loading ? "检索中..." : "开始检索"}
          </button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </div>

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
    </section>
  )
}
