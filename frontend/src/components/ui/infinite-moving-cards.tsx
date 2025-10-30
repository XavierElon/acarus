'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className
}: {
  items: {
    icon?: React.ReactNode
    title: string
    description: string
    bgColor?: string
    borderColor?: string
    glowColor?: string
    hoverBorderColor?: string
    hoverGlowColor?: string
    iconBgColor?: string
  }[]
  direction?: 'left' | 'right'
  speed?: 'slow' | 'normal' | 'fast'
  pauseOnHover?: boolean
  className?: string
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLUListElement>(null)

  useEffect(() => {
    addAnimation()
  }, [])

  const [start, setStart] = useState(false)

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem)
        }
      })

      getDirection()
      getSpeed()
      setStart(true)
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty('--animation-direction', 'forwards')
      } else {
        containerRef.current.style.setProperty('--animation-direction', 'reverse')
      }
    }
  }

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '20s')
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', '40s')
      } else {
        containerRef.current.style.setProperty('--animation-duration', '80s')
      }
    }
  }

  return (
    <div ref={containerRef} className={cn('scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]', className)}>
      <ul ref={scrollerRef} className={cn('flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap', start && 'animate-scroll', pauseOnHover && 'hover:[animation-play-state:paused]')}>
        {items.map((item, idx) => (
          <li
            className="w-[350px] max-w-full relative rounded-2xl flex-shrink-0 backdrop-blur border transition-all duration-300 hover:scale-105 group"
            style={{
              backgroundColor: item.bgColor || 'rgba(255, 255, 255, 0.1)',
              borderColor: item.borderColor || 'rgba(255, 255, 255, 0.2)',
              boxShadow: item.glowColor ? `0 0 20px ${item.glowColor}` : 'none'
            }}
            onMouseEnter={(e) => {
              if (item.hoverBorderColor) {
                e.currentTarget.style.borderColor = item.hoverBorderColor
              }
              if (item.hoverGlowColor) {
                e.currentTarget.style.boxShadow = `0 10px 30px ${item.hoverGlowColor}`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = item.borderColor || 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.boxShadow = item.glowColor ? `0 0 20px ${item.glowColor}` : 'none'
            }}
            key={`${item.title}-${idx}`}>
            <div className="p-6">
              <div className="relative mb-4">
                {item.iconBgColor && <div className="absolute inset-0 rounded-full blur-xl group-hover:blur-2xl transition-all" style={{ backgroundColor: item.iconBgColor }} />}
                <div className="relative">{item.icon}</div>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
