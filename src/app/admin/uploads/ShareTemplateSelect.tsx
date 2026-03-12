'use client'

import { useState, useTransition } from 'react'
import { setShareTemplate } from '@/app/actions'

const templates = [
  { id: 'classic', name: '经典模板' },
  { id: 'minimal', name: '极简模板' },
]

export default function ShareTemplateSelect({
  filename,
  value,
}: {
  filename: string
  value?: string
}) {
  const [current, setCurrent] = useState(value || 'classic')
  const [isPending, startTransition] = useTransition()

  const handleChange = (next: string) => {
    setCurrent(next)
    startTransition(async () => {
      await setShareTemplate(filename, next)
    })
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>模板</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="h-8 rounded-md border bg-background px-2 text-xs"
        disabled={isPending}
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  )
}
