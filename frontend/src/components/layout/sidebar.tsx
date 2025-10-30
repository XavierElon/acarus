'use client'

import { useState } from 'react'
import { Menu, X, Home, Receipt, Plus, Settings, BarChart3, Calendar, Tag, User, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <Logo size="md" />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="p-4">
          <SidebarContent isCollapsed={false} />
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:bg-background lg:border-r transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className={`flex items-center p-4 border-b ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? <Logo size="md" /> : <Logo size="sm" showText={false} />}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <nav className="p-4">
          <SidebarContent isCollapsed={isCollapsed} />
        </nav>
      </div>
    </>
  )
}

function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Receipts', href: '/receipts', icon: Receipt },
    { name: 'New Receipt', href: '/receipts/new', icon: Plus },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Admin', href: '/admin', icon: Shield }
  ]

  return (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.name} href={item.href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`} title={isCollapsed ? item.name : undefined}>
            <item.icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        )
      })}
    </div>
  )
}
