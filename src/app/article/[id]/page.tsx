import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import * as cheerio from 'cheerio';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import SharePanel from '@/components/SharePanel'
import SwipeNavigator from '@/components/SwipeNavigator'
import SectionCarousel from '@/components/SectionCarousel'

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

export default async function ArticlePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { q } = await searchParams
  const searchQuery = typeof q === 'string' ? q : ''
  
  if (!id || typeof id !== 'string' || id.trim() === '') {
    notFound()
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { 
      categories: true,
      tags: true
    }
  })

  const articleList = await prisma.article.findMany({
    select: { id: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  })
  const index = articleList.findIndex((item) => item.id === id)
  const prevId = index > 0 ? articleList[index - 1]?.id : null
  const nextId = index >= 0 && index < articleList.length - 1 ? articleList[index + 1]?.id : null

  if (!article) {
    notFound()
  }

  // Parse HTML for TOC and highlight search terms
  const $ = cheerio.load(article.content);
  const headings: { id: string; text: string; level: number }[] = [];
  
  // Highlight search terms in content if query exists
  if (searchQuery) {
    $('*:not(script, style, pre, code)').each((_, el) => {
      const text = $(el).text();
      if (text && text.toLowerCase().includes(searchQuery.toLowerCase())) {
        // Simple highlighting - wrap matching text in span with highlight class
        const highlighted = text.replace(
          new RegExp(`(${searchQuery})`, 'gi'), 
          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
        );
        $(el).html(highlighted);
      }
    });
  }
  
  // Extract sections by H2 headings only (H3 content merged into H2)
  const sections: { title: string; level: number; content: string }[] = [];
  let currentSection: { title: string; level: number; content: string } | null = null;
  
  // Process all elements sequentially
  $('body').children().each((_, el) => {
    const tagName = el.tagName?.toLowerCase();
    
    if (tagName === 'h2') {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }
      
      const text = $(el).text();
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '');
      $(el).attr('id', id);
      
      headings.push({
        id,
        text,
        level: 2
      });
      
      // Start new H2 section
      currentSection = {
        title: text,
        level: 2,
        content: ''
      };
    } else if (tagName === 'h3') {
      // Inject H3 as bold text within current section (if any)
      if (currentSection) {
        const h3Text = $(el).text();
        currentSection.content += `<p><strong>${h3Text}</strong></p>`;
      }
      // If no current section, treat as regular content
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += $.html(el);
    } else {
      // Content before first H2 heading - add to a default section
      if (sections.length === 0) {
        sections.push({
          title: '',
          level: 2,
          content: $.html(el)
        });
      } else {
        sections[sections.length - 1].content += $.html(el);
      }
    }
  });
  
  // Save last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return (
    <SwipeNavigator prevHref={prevId ? `/article/${prevId}` : null} nextHref={nextId ? `/article/${nextId}` : null}>
    <div className="max-w-7xl mx-auto flex gap-10 pb-20">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* 搜索栏已移除 */}
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

          <div className="mt-4">
            <SharePanel />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Article Body - Section Carousel (Mobile) / Cards (Desktop) */}
        <SectionCarousel sections={sections} />
        
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
    </SwipeNavigator>
  )
}