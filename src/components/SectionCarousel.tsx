'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import SectionCard from '@/components/SectionCard'

interface SectionCarouselProps {
  sections: { title: string; level: number; content: string }[]
}

// Helper to remove common numbering patterns from titles
const cleanTitle = (title: string): string => {
  if (!title) return title
  
  // Remove common numbering patterns
  const cleaned = title
    .replace(/^(\d+\.?\s*)/, '') // "1. ", "2 ", etc.
    .replace(/^第[一二三四五六七八九十\d]+[章节节]\s*/, '') // "第1章", "第2节", etc.
    .replace(/^[（(][一二三四五六七八九十\d]+[）)]\s*/, '') // "（一）", "(1)", etc.
    .replace(/^[A-Za-z]\.\s*/, '') // "A. ", "B ", etc.
    .trim()
  
  return cleaned || title
}

export default function SectionCarousel({ sections }: SectionCarouselProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // For desktop, show normal cards
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <SectionCard 
            key={index} 
            title={cleanTitle(section.title)} 
            level={section.level}
          >
            <div 
              className="prose prose-sm dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:text-primary 
                prose-a:text-secondary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </SectionCard>
        ))}
      </div>
    )
  }

  // For mobile, show carousel
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        className="mySwiper"
      >
        {sections.map((section, index) => (
          <SwiperSlide key={index}>
            <SectionCard 
              title={cleanTitle(section.title)} 
              level={section.level}
            >
              <div 
                className="prose prose-sm dark:prose-invert max-w-none 
                  prose-headings:font-bold prose-headings:text-primary 
                  prose-a:text-secondary prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </SectionCard>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom navigation buttons for better mobile UX */}
    </div>
  )
}