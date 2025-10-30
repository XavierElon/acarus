'use client'

import { Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <div className={cn('bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg', sizeClasses[size])}>
          <Receipt className={cn('text-white', size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-7 w-7')} />
        </div>
        {/* Subtle accent dot */}
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full"></div>
      </div>
      {showText && <span className={cn('font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent', textSizeClasses[size])}>Acarus</span>}
    </div>
  )
}
