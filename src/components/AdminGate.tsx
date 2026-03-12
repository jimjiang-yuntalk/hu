"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

const PASSWORD = "Admin123"
const STORAGE_KEY = "admin_access_granted"

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = React.useState(false)
  const promptedRef = React.useRef(false)
  const router = useRouter()

  React.useEffect(() => {
    if (promptedRef.current) return
    promptedRef.current = true

    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached === "true") {
      setAllowed(true)
      return
    }

    const input = window.prompt("请输入管理后台密码", PASSWORD)
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true")
      setAllowed(true)
    } else {
      window.alert("密码错误")
      router.replace("/")
    }
  }, [router])

  if (!allowed) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        正在验证...
      </div>
    )
  }

  return <>{children}</>
}
