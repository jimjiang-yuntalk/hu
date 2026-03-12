import { listUploads } from '@/lib/uploads'
import { readSocialConfig } from '@/lib/social-config'
import { readShareTemplates } from '@/lib/share-templates'
import VideoChannelQuickAdd from '@/components/VideoChannelQuickAdd'
import SocialQrConfig from './SocialQrConfig'
import ShareTemplateSelect from './ShareTemplateSelect'
import DeleteUploadButton from './DeleteUploadButton'
import EditUploadName from './EditUploadName'

export const dynamic = 'force-dynamic'

const formatDate = (ms: number) =>
  new Date(ms).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function AdminUploadsPage() {
  const [uploads, socialConfig, shareTemplates] = await Promise.all([
    listUploads(),
    readSocialConfig(),
    readShareTemplates(),
  ])

  return (
    <div className="py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">羽拨心弦内容运维</h1>
        <p className="text-muted-foreground mt-2">管理视频号内容、作品上传与分享模板</p>
      </div>

      <VideoChannelQuickAdd />      <SocialQrConfig initial={socialConfig} />

      {uploads.length === 0 ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无上传内容</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploads.map((item) => (
            <div key={item.url} className="rounded-xl border bg-card overflow-hidden">
              <a href={item.url} target="_blank" rel="noreferrer" className="block">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.name} className="h-44 w-full object-cover" />
                ) : item.type === 'video' ? (
                  <video src={item.url} className="h-44 w-full object-cover" controls preload="metadata" />
                ) : (
                  <div className="h-44 w-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                    文件预览不可用
                  </div>
                )}
              </a>
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium break-all">{item.name}</div>
                <div className="text-xs text-muted-foreground">{formatDate(item.mtime)}</div>
                <ShareTemplateSelect
                  filename={item.name}
                  value={shareTemplates[item.name.replace(/[^a-zA-Z0-9._-]/g, '_')]}
                />
                <div className="flex flex-wrap gap-2 justify-end">
                  <EditUploadName filename={item.name} />
                  <DeleteUploadButton filename={item.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
