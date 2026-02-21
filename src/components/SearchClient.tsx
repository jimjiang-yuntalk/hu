"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AnswerPanel from "@/components/AnswerPanel"
import EvidencePanel from "@/components/EvidencePanel"
import type { Citation } from "@/lib/kb-search-rag"

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [answer, setAnswer] = useState("")
  const [citations, setCitations] = useState<Citation[]>([])
  const [active, setActive] = useState<Citation | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const fetchAnswer = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError("")
    setAnswer("")
    setCitations([])
    setActive(undefined)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "检索失败")
      }
      const data = await res.json()
      setAnswer(data?.answer_markdown || "")
      setCitations(data?.citations || [])
    } catch (err: any) {
      setError(err?.message || "检索失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) fetchAnswer(initialQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const onSearch = () => {
    if (!query.trim()) return
    const q = query.trim()
    router.push(`/search?q=${encodeURIComponent(q)}`)
    fetchAnswer(q)
  }

  const onCitationClick = (citeId: string) => {
    const found = citations.find((c) => c.cite_id === citeId)
    if (found) setActive(found)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-muted/40 p-4">
        <div className="text-sm text-muted-foreground mb-2">你的问题</div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入你的问题..."
            className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm focus:outline-none"
          />
          <button
            onClick={onSearch}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            disabled={loading}
          >
            {loading ? "检索中..." : "搜索"}
          </button>
        </div>
        {error && <div className="text-xs text-destructive mt-2">{error}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="text-sm text-muted-foreground">检索结果</div>
          {citations.length === 0 && !loading ? (
            <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              暂无相关内容
            </div>
          ) : (
            citations.map((c) => (
              <div key={c.cite_id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.heading}</div>
                  </div>
                  <Link
                    href={c.url}
                    className="text-xs text-primary hover:underline"
                  >
                    查看原文 →
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground mt-3 line-clamp-3">
                  {c.snippet}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-4">
          <AnswerPanel answerMarkdown={answer} citations={citations} onCitationClick={onCitationClick} />
          <EvidencePanel citation={active} />
        </div>
      </div>
    </div>
  )
}
