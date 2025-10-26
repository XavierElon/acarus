'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="p-4">
          <SidebarContent />
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-background lg:border-r">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
        </div>
        <nav className="p-4">
          <SidebarContent />
        </nav>
      </div>
    </>
  )
}

function SidebarContent() {
  return (
    <div className="space-y-2">
      <a href="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
        Dashboard
      </a>
      <a href="/receipts" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
        Receipts
      </a>
      <a href="/receipts/new" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
        New Receipt
      </a>
      <a href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
        Admin
      </a>
    </div>
  )
}
