"use client"

import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

const modules = [
  { href: "/admin/kb", label: "知识库运维" },
  { href: "/admin/qa", label: "斛兵论道运维" },
  { href: "/admin/yuboxinxian", label: "羽拨心弦运维" },
  { href: "/admin/quotes", label: "羽坛金句运维" },
  { href: "/admin/system", label: "系统配置" },
]

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
              <Link href="/admin/kb" className="hover:text-primary">人机协同</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/" className="text-muted-foreground hover:text-primary">AI乒羽馆主页</Link>
            </div>
            {/* Theme toggle moved to system config, so removed from here */}
          </div>
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="rounded-full border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
        {children}
      </div>
    </div>
  )
}
