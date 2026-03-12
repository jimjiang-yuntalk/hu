"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const getPreferredTheme = () => {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
}

export default function ThemeToggle({ showText = true }: { showText?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const initial = getPreferredTheme()
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    window.localStorage.setItem("theme", next)
    applyTheme(next)
  }

  return (
    <Button
      variant="secondary"
      onClick={toggle}
      className={cn("w-full justify-start gap-2", !showText && "justify-center px-0 w-10 h-10")}
      title={theme === "dark" ? "切换到明亮模式" : "切换到暗黑模式"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showText && <span>{theme === "dark" ? "明亮模式" : "暗黑模式"}</span>}
    </Button>
  )
}
