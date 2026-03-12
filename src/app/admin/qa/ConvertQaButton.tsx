"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ConvertQaButton({ id, articleId }: { id: string; articleId?: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConvert = async () => {
    if (loading || articleId) return
    setLoading(true)
    try {
      const res = await fetch("/api/qa-to-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "转换失败")
      }
      const data = await res.json()
      if (data?.articleId) {
        router.push(`/admin/edit/${data.articleId}`)
        return
      }
      throw new Error("转换失败")
    } catch (e: any) {
      alert(e?.message || "转换失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConvert}
      className="text-xs text-primary hover:underline disabled:opacity-50"
      disabled={loading || !!articleId}
      title={articleId ? "已转为文章" : "转为文章"}
    >
      {articleId ? "已转" : loading ? "转换中..." : "转为文章"}
    </button>
  )
}
