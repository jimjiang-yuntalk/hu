import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import * as cheerio from 'cheerio';
import Link from 'next/link';
import { Tag } from 'lucide-react';

// Helper for Chinese translations
const difficultyMap: Record<string, string> = {
  'L1_Beginner': '初级 (Level 1)',
  'L2_Amateur': '业余 (Level 2)',
  'L3_Advanced': '进阶 (Level 3)',
  'L4_Pro': '专业 (Level 4)',
}

const courtAreaMap: Record<string, string> = {
  'Net': '网前',
  'Mid': '中场',
  'Rear': '后场',
  'Full': '全场',
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: { 
      categories: true,
      tags: true
    }
  })

  if (!article) {
    notFound()
  }

  // Parse HTML for TOC
  const $ = cheerio.load(article.content);
  const headings: { id: string; text: string; level: number }[] = [];
  
  $('h2, h3').each((_, el) => {
    const text = $(el).text();
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, ''); // Simple slugify
    $(el).attr('id', id); // Inject ID back into content (we need to render the modified HTML)
    headings.push({
      id,
      text,
      level: parseInt(el.tagName.substring(1))
    });
  });

  const contentWithIds = $('body').html() || article.content;

  return (
    <div className="max-w-7xl mx-auto flex gap-10 pb-20">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary">首页</Link>
            <span>/</span>
            <span>{article.categories[0]?.name.split('(')[0] || 'Uncategorized'}</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-primary break-words">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-3">
            {article.difficulty && (
              <Link href={`/difficulty/${article.difficulty}`}>
                <Badge variant="outline" className="text-sm py-1 px-3 border-secondary text-secondary-foreground bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer">
                  难度: {difficultyMap[article.difficulty] || article.difficulty}
                </Badge>
              </Link>
            )}
            {article.court_area && (
              <Link href={`/area/${article.court_area}`}>
                <Badge variant="outline" className="text-sm py-1 px-3 hover:bg-accent transition-colors cursor-pointer">
                  区域: {courtAreaMap[article.court_area] || article.court_area}
                </Badge>
              </Link>
            )}
            {article.categories.map(c => (
              <Link key={c.id} href={`/category/${c.slug}`}>
                <Badge variant="secondary" className="text-sm py-1 px-3 hover:bg-secondary/80 transition-colors cursor-pointer">
                  分类: {c.name.split('(')[0]}
                </Badge>
              </Link>
            ))}
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {article.tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Article Body - TipTap HTML */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:text-primary 
            prose-a:text-secondary prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />
        
        {article.video_url && (
          <div className="mt-10 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-bold mb-2">教学视频</h3>
            <a href={article.video_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
              {article.video_url}
            </a>
          </div>
        )}
      </div>

      {/* Table of Contents (Sticky Sidebar) */}
      <div className="w-64 hidden lg:block shrink-0">
        <div className="sticky top-4">
          <h4 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
            目录
          </h4>
          <nav className="flex flex-col gap-1 text-sm border-l-2 border-muted pl-4">
            {headings.length === 0 && (
              <span className="text-muted-foreground italic">无目录</span>
            )}
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`
                  block py-1 hover:text-primary transition-colors text-muted-foreground
                  ${heading.level === 3 ? 'pl-4' : ''}
                `}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
