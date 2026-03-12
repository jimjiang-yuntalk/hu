"use client"

import { useState } from "react"

export default function AdminLoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        throw new Error("密码错误")
      }
      // 使用整页跳转，确保 Set-Cookie 立即生效，避免首次登录后又被中间件重定向
      window.location.href = next
    } catch (err: any) {
      setError(err?.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6">
        <div className="text-lg font-semibold">管理员验证</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          placeholder="请输入密码"
          autoFocus
        />
        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm disabled:opacity-60"
        >
          {loading ? "验证中..." : "进入"}
        </button>
      </form>
    </div>
  )
}
