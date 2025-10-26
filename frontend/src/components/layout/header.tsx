'use client'

import { Menu, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const { user, isDevMode } = useAuth()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const currentUser = session?.user || user

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Receipt Processor</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <Button variant="ghost" size="icon" onClick={() => setShowProfileMenu(!showProfileMenu)} className="relative">
              <User className="h-4 w-4" />
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-50">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                  {isDevMode && <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Dev Mode</span>}
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/profile')
                      setShowProfileMenu(false)
                    }}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/settings')
                      setShowProfileMenu(false)
                    }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <div className="border-t my-1" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleSignOut()
                      setShowProfileMenu(false)
                    }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
