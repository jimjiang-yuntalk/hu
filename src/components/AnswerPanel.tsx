"use client"

import { useEffect, useMemo, useRef } from "react"
import { marked } from "marked"
import type { Citation } from "@/lib/kb-search-rag"

export default function AnswerPanel({
  answerMarkdown,
  citations,
  onCitationClick,
}: {
  answerMarkdown: string
  citations: Citation[]
  onCitationClick: (citeId: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const html = useMemo(() => {
    return marked.parse(answerMarkdown || "")
  }, [answerMarkdown])

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const handler = (e: Event) => {
      const target = e.target as HTMLElement
      if (target?.tagName !== "A") return
      const href = (target as HTMLAnchorElement).getAttribute("href") || ""
      if (href.startsWith("cite:")) {
        e.preventDefault()
        const citeId = href.replace("cite:", "")
        onCitationClick(citeId)
      }
    }
    root.addEventListener("click", handler)
    return () => root.removeEventListener("click", handler)
  }, [onCitationClick])

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-sm text-muted-foreground mb-2">回答</div>
      <div ref={ref} className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      {citations.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {citations.map((c) => (
            <button
              key={c.cite_id}
              onClick={() => onCitationClick(c.cite_id)}
              className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 hover:bg-primary/20"
            >
              {c.title} · {c.heading}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
