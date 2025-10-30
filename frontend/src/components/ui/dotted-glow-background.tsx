'use client'

import { useEffect, useRef } from 'react'

interface DottedGlowBackgroundProps {
  className?: string
  opacity?: number
  gap?: number
  radius?: number
  colorLightVar?: string
  glowColorLightVar?: string
  colorDarkVar?: string
  glowColorDarkVar?: string
  backgroundOpacity?: number
  speedMin?: number
  speedMax?: number
  speedScale?: number
}

export function DottedGlowBackground({ className = '', opacity = 1, gap = 10, radius = 1.6, colorLightVar = '--color-neutral-500', glowColorLightVar = '--color-neutral-600', colorDarkVar = '--color-neutral-500', glowColorDarkVar = '--color-sky-800', backgroundOpacity = 0, speedMin = 0.3, speedMax = 1.6, speedScale = 1 }: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let dots: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      glowRadius: number
    }> = []

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // Set actual canvas size in memory (scaled for retina displays)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      // Scale the canvas back down using CSS
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'

      // Scale the drawing context so all drawing operations
      // work in CSS pixels instead of device pixels
      ctx.scale(dpr, dpr)

      initializeDots()
    }

    const initializeDots = () => {
      dots = []

      // Use CSS dimensions, not scaled canvas dimensions
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const cols = Math.ceil(rect.width / gap)
      const rows = Math.ceil(rect.height / gap)

      for (let i = 0; i < cols * rows; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const speed = (Math.random() * (speedMax - speedMin) + speedMin) * speedScale

        dots.push({
          x: col * gap + gap / 2,
          y: row * gap + gap / 2,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: radius,
          glowRadius: radius * 2
        })
      }
    }

    const isLightMode = document.documentElement.classList.contains('light')

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Set background
      if (backgroundOpacity > 0) {
        const rect = canvas.getBoundingClientRect()
        ctx.fillStyle = `rgba(255, 255, 255, ${backgroundOpacity})`
        if (isLightMode) {
          ctx.fillStyle = `rgba(0, 0, 0, ${backgroundOpacity})`
        }
        ctx.fillRect(0, 0, rect.width, rect.height)
      }

      // Update and draw dots
      dots.forEach((dot) => {
        // Update position
        dot.x += dot.vx
        dot.y += dot.vy

        // Bounce off edges
        const rect = canvas.getBoundingClientRect()
        if (dot.x <= 0 || dot.x >= rect.width) dot.vx *= -1
        if (dot.y <= 0 || dot.y >= rect.height) dot.vy *= -1

        // Keep in bounds
        dot.x = Math.max(0, Math.min(rect.width, dot.x))
        dot.y = Math.max(0, Math.min(rect.height, dot.y))

        // Draw glow
        const gradient = ctx.createRadialGradient(dot.x, dot.y, dot.radius, dot.x, dot.y, dot.glowRadius)

        const glowColor = isLightMode ? getComputedStyle(document.documentElement).getPropertyValue(glowColorLightVar) || '#525252' : getComputedStyle(document.documentElement).getPropertyValue(glowColorDarkVar) || '#0c4a6e'

        gradient.addColorStop(
          0,
          `${glowColor}${Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, '0')}`
        )
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Draw dot
        const dotColor = isLightMode ? getComputedStyle(document.documentElement).getPropertyValue(colorLightVar) || '#525252' : getComputedStyle(document.documentElement).getPropertyValue(colorDarkVar) || '#525252'

        ctx.fillStyle = `${dotColor}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
      resizeCanvas()
      animate()
    }, 100)

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [gap, radius, opacity, colorLightVar, glowColorLightVar, colorDarkVar, glowColorDarkVar, backgroundOpacity, speedMin, speedMax, speedScale])

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} />
}
