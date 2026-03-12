"use client"

import { useState } from "react"

export default function ReportGenerator({ 
  question, 
  answer,
  onGenerate 
}: { 
  question: string,
  answer: string,
  onGenerate?: (report: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const generateReport = () => {
    const report = `【斛教练羽毛球技术报告】\n\n问题: ${question}\n\n回答: ${answer}\n\n#羽毛球 #斛教练 #技术分析`
    if (onGenerate) {
      onGenerate(report)
    }
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToSocial = () => {
    const report = `【斛教练羽毛球技术报告】\n\n问题: ${question}\n\n回答: ${answer}\n\n#羽毛球 #斛教练 #技术分析`
    const encodedReport = encodeURIComponent(report)
    
    // 尝试多个社交媒体平台
    const socialUrls = [
      `https://twitter.com/intent/tweet?text=${encodedReport}`,
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedReport}`,
      `https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedReport}`
    ]
    
    // 打开第一个可用的
    window.open(socialUrls[0], '_blank')
  }

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={generateReport}
        className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 hover:bg-primary/20"
      >
        {copied ? '已复制!' : '生成报告'}
      </button>
      <button
        onClick={shareToSocial}
        className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1 hover:bg-secondary/20"
      >
        分享到社交
      </button>
    </div>
  )
}