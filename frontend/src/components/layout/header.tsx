'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Receipt Processor</h1>
        </div>
        <div className="flex items-center space-x-4">{/* Add user menu or other header items here */}</div>
      </div>
    </header>
  )
}
