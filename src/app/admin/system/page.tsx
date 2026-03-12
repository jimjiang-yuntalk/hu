"use client"

import { useEffect, useState } from "react"
import ThemeToggle from "@/components/ThemeToggle"

export default function SystemSettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    // 获取当前密码（如果需要显示的话）
    const getPassword = async () => {
      try {
        // 这里可以添加获取密码的逻辑，但出于安全考虑，通常不显示实际密码
        // 只显示密码是否已设置
      } catch (error) {
        console.error("获取密码信息失败:", error)
      }
    }
    getPassword()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">系统配置</h1>
        <p className="text-muted-foreground mt-2">管理系统的各项配置选项。</p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">界面主题</h2>
          <div className="flex items-center gap-4">
            <ThemeToggle showText={false} />
            <span className="text-sm text-muted-foreground">切换暗黑/明亮模式</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">管理员密码</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              管理员密码已在服务器配置中设置。
            </p>
            <p className="text-sm text-muted-foreground">
              如需修改密码，请编辑服务器上的 .env 文件中的 ADMIN_PASSWORD 配置项。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}