"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Citation } from "@/lib/kb-search-rag"

const highlightSnippet = (root: HTMLElement, snippet: string) => {
  if (!snippet) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.includes(snippet)) {
      const textNode = node as Text
      const value = textNode.nodeValue || ""
      const idx = value.indexOf(snippet)
      const range = document.createRange()
      range.setStart(textNode, idx)
      range.setEnd(textNode, idx + snippet.length)
      const mark = document.createElement("mark")
      range.surroundContents(mark)
      return
    }
    textNodes.push(node as Text)
  }
}

export default function EvidencePanel({ citation }: { citation?: Citation }) {
  const [html, setHtml] = useState<string>("")
  const ref = useRef<HTMLDivElement>(null)

  const fileParam = useMemo(() => {
    if (!citation) return ""
    const filePath = citation.file_path
    const b64 = btoa(unescape(encodeURIComponent(filePath)))
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  }, [citation])

  useEffect(() => {
    const load = async () => {
      if (!citation) return
      const res = await fetch(`/api/kb/render?file=${fileParam}`)
      const data = await res.json()
      setHtml(data?.html || "")
    }
    load()
  }, [citation, fileParam])

  useEffect(() => {
    if (!citation || !ref.current) return
    const root = ref.current
    const anchor = citation.anchor
    if (anchor) {
      const safe = (globalThis as any).CSS?.escape ? (globalThis as any).CSS.escape(anchor) : anchor.replace(/[^a-zA-Z0-9_-]/g, "")
      const el = root.querySelector(`#${safe}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    highlightSnippet(root, citation.snippet)
  }, [citation, html])

  return (
    <div className="rounded-xl border bg-card p-4 h-full overflow-auto">
      <div className="text-sm text-muted-foreground mb-2">证据 / 文章</div>
      {citation ? (
        <div ref={ref} className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="text-sm text-muted-foreground">点击左侧引用查看对应文章内容</div>
      )}
    </div>
  )
}
