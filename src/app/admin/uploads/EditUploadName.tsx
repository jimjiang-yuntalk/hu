'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { renameUploadFile } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Pencil, Check, X } from 'lucide-react'

export default function EditUploadName({ filename }: { filename: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(filename)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    setError('')
    startTransition(async () => {
      try {
        await renameUploadFile(filename, value)
        setEditing(false)
        router.refresh()
      } catch (err: any) {
        setError(err?.message || '保存失败')
      }
    })
  }

  const handleCancel = () => {
    setValue(filename)
    setError('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4 mr-1" />
        编辑
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
          placeholder="输入新文件名"
        />
        {error && <div className="text-xs text-destructive">{error}</div>}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Check className="h-4 w-4 mr-1" />
          保存
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          <X className="h-4 w-4 mr-1" />
          取消
        </Button>
      </div>
    </div>
  )
}
