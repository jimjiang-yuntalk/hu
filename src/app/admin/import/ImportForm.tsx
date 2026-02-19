'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle, ArrowLeft, Save, Plus, FilePlus, FileEdit } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { marked } from 'marked'

interface Category {
  id: string
  name: string
  parentId: string | null
}

interface Article {
  id: string
  title: string
}

interface ImportFormProps {
  categories: Category[]
  articles: Article[]
}

type Step = 'upload' | 'analyzing' | 'review' | 'saving' | 'done'

export default function ImportForm({ categories, articles }: ImportFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [url, setUrl] = useState('')
  
  // Analysis Result & Form State
  const [analysis, setAnalysis] = useState<any>(null)
  const [mode, setMode] = useState<'create' | 'append'>('create')
  const [targetId, setTargetId] = useState<string>('') // CategoryId or ArticleId
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    difficulty: 'L1_Beginner',
    court_area: 'Full'
  })

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    startAnalysis(file)
  }

  const handleUrlSubmit = () => {
    if (!url) return
    startAnalysis(null, url)
  }

  const startAnalysis = async (file: File | null, urlInput?: string) => {
    setIsLoading(true)
    setStep('analyzing')
    setLogs([])
    addLog('开始分析内容...')

    const form = new FormData()
    if (file) form.append('file', file)
    if (urlInput) form.append('url', urlInput)

    try {
      const res = await fetch('/api/smart-import/analyze', {
        method: 'POST',
        body: form
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      addLog('AI 分析完成')
      setAnalysis(data.analysis)
      
      // Initialize form with AI results
      setFormData({
        title: data.analysis.title,
        content: data.analysis.content,
        tags: (data.analysis.tags || []).join(', '),
        difficulty: data.analysis.difficulty || 'L1_Beginner',
        court_area: data.analysis.court_area || 'Full'
      })
      
      // Default to create mode with suggested category
      setMode('create')
      setTargetId(data.analysis.categoryId || '')
      
      setStep('review')
    } catch (error: any) {
      addLog(`Error: ${error.message}`)
      setStep('upload') // Go back on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!targetId) {
      alert('请选择目标分类或文章')
      return
    }

    setIsLoading(true)
    setStep('saving')
    addLog('正在保存...')

    try {
      // Convert Markdown to HTML before saving, because Tiptap and the View page expect HTML
      const htmlContent = await marked.parse(formData.content)

      const payload = {
        mode,
        targetId,
        ...formData,
        content: htmlContent, // Send HTML to backend
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      const res = await fetch('/api/smart-import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      addLog('保存成功！')
      setStep('done')
      setTimeout(() => {
        router.push(`/article/${data.articleId}`)
      }, 1500)
    } catch (error: any) {
      addLog(`Error: ${error.message}`)
      setStep('review')
    } finally {
      setIsLoading(false)
    }
  }

  // Render Logic
  if (step === 'upload' || step === 'analyzing') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                文件上传
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/50 transition-colors relative">
                <input 
                  type="file" 
                  accept=".pdf,.md,.txt" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    点击或拖拽上传 PDF / Markdown / TXT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                网页抓取
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="https://example.com/badminton-article" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                className="w-full" 
                onClick={handleUrlSubmit}
                disabled={isLoading || !url}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '开始智能抓取'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>处理日志</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 bg-black/5 rounded-md m-6 mt-0 p-4 font-mono text-sm overflow-y-auto min-h-[300px]">
            {logs.length === 0 ? (
              <span className="text-muted-foreground">等待任务...</span>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="break-all border-l-2 border-primary pl-2">
                    {log}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-primary animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    AI 正在思考中...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Review Step
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Configuration */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>导入设置 (Settings)</CardTitle>
            <CardDescription>请确认或修改导入信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Mode Switch */}
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
              <Button 
                variant={mode === 'create' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setMode('create')}
                className="w-full"
              >
                <FilePlus className="mr-2 h-4 w-4" />
                新建文章
              </Button>
              <Button 
                variant={mode === 'append' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setMode('append')}
                className="w-full"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                追加内容
              </Button>
            </div>

            {/* Target Selection */}
            <div className="space-y-2">
              <Label>
                {mode === 'create' ? '选择目标分类 (Category)' : '选择目标文章 (Target Article)'}
              </Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择..." />
                </SelectTrigger>
                <SelectContent>
                  {mode === 'create' ? (
                    categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  ) : (
                    articles.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Metadata Fields */}
            <div className="space-y-2">
              <Label>标题 (Title)</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>难度 (Difficulty)</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={v => setFormData({...formData, difficulty: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1_Beginner">初级</SelectItem>
                    <SelectItem value="L2_Amateur">业余</SelectItem>
                    <SelectItem value="L3_Advanced">进阶</SelectItem>
                    <SelectItem value="L4_Pro">专业</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>场区 (Area)</Label>
                <Select 
                  value={formData.court_area} 
                  onValueChange={v => setFormData({...formData, court_area: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full">全场</SelectItem>
                    <SelectItem value="Net">网前</SelectItem>
                    <SelectItem value="Mid">中场</SelectItem>
                    <SelectItem value="Rear">后场</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>标签 (Tags)</Label>
              <Input 
                value={formData.tags} 
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="逗号分隔"
              />
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={handleSave} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {step === 'saving' ? '保存中...' : '确认导入 (Confirm Import)'}
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setStep('upload')}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              重新上传
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Content Preview */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>内容预览 (Preview)</CardTitle>
            <CardDescription>
              上方编辑 Markdown 源码，下方预览渲染效果。
              <br/>
              <span className="text-xs text-muted-foreground">保存时会自动转换为 HTML 以适配编辑器。</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea 
              className="flex-1 font-mono text-sm min-h-[300px]"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="# 输入 Markdown 内容..."
            />
            
            <div className="border rounded-md p-4 bg-muted/20 h-[300px] overflow-y-auto">
              <h3 className="text-sm font-bold mb-2 text-muted-foreground">渲染预览 (Read-only):</h3>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(formData.content) as string }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
