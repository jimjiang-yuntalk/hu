'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Tag {
  name: string
  count: number
  id: string
  slug?: string
}

interface TagCloudProps {
  tags: Tag[]
}

export default function TagCloud({ tags }: TagCloudProps) {
  const router = useRouter()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // 处理标签点击统计
  const handleTagClick = async (tagName: string) => {
    setSelectedTag(tagName)

    // 发送点击统计到后端
    try {
      await fetch('/api/tag-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: tagName }),
      })
    } catch (error) {
      console.error('Failed to record tag click:', error)
    }
  }

  // 计算最小和最大点击次数用于缩放
  const counts = tags.map(tag => tag.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  const countRange = maxCount - minCount || 1

  // 颜色配置（从浅到深的渐变）
  const colors = [
    'text-blue-400',
    'text-green-400',
    'text-purple-400',
    'text-red-400',
    'text-yellow-400',
    'text-pink-400',
    'text-indigo-400'
  ]

  // 计算字体大小和颜色
  const getTagStyle = (count: number) => {
    // 字体大小：12px 到 48px
    const fontSize = 12 + ((count - minCount) / countRange) * 36
    // 颜色基于点击次数的哈希值
    const colorIndex = Math.floor((count * 7) % colors.length)
    return {
      fontSize: `${fontSize}px`,
      className: colors[colorIndex]
    }
  }

  if (tags.length === 0) {
    return <div className="text-center text-muted-foreground">暂无标签数据</div>
  }

  return (
    <div className="tag-cloud flex flex-wrap justify-center items-center gap-4 p-8 min-h-[400px]">
      {tags.map((tag) => {
        const style = getTagStyle(tag.count)
        const isSelected = selectedTag === tag.name

        const categoryUrl = tag.slug
          ? `/category/${tag.slug}`
          : `/?q=${encodeURIComponent(tag.name)}`

        return (
          <Link
            key={tag.id}
            href={categoryUrl}
            onClick={(e) => {
              e.preventDefault()
              handleTagClick(tag.name)
              router.push(categoryUrl)
            }}
            className={`${style.className} cursor-pointer transition-all duration-300 hover:scale-110 ${
              isSelected ? 'font-bold underline' : ''
            }`}
            style={{
              fontSize: style.fontSize,
              lineHeight: '1.2',
              userSelect: 'none'
            }}
            title={`点击次数: ${tag.count}`}
          >
            {tag.name}
          </Link>
        )
      })}
    </div>
  )
}
