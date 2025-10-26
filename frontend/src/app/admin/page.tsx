'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Shield, Eye, Code, Database, Settings, Users, FileText, BarChart3, Calendar, Tag, Plus } from 'lucide-react'
import Link from 'next/link'

const adminPages = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Main dashboard with statistics and charts',
    color: 'bg-blue-500'
  },
  {
    name: 'Receipts List',
    href: '/receipts',
    icon: FileText,
    description: 'View all receipts with search and filtering',
    color: 'bg-green-500'
  },
  {
    name: 'New Receipt',
    href: '/receipts/new',
    icon: Plus,
    description: 'Create a new receipt',
    color: 'bg-purple-500'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Advanced analytics and reporting',
    color: 'bg-orange-500'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Calendar view of receipts',
    color: 'bg-pink-500'
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: Tag,
    description: 'Manage receipt categories',
    color: 'bg-indigo-500'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings and preferences',
    color: 'bg-gray-500'
  }
]

export default function AdminPage() {
  const [selectedReceiptId, setSelectedReceiptId] = useState('')
  const { isDevMode, enableDevMode, disableDevMode } = useAdminAuth()

  const toggleDevMode = () => {
    if (isDevMode) {
      disableDevMode()
    } else {
      enableDevMode()
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-yellow-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">Developer access to all application pages</p>

          {/* Dev Mode Toggle */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Developer Mode
              </CardTitle>
              <CardDescription>Toggle authentication bypass for development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button onClick={toggleDevMode} variant={isDevMode ? 'default' : 'outline'} className="flex-1">
                  {isDevMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
                </Button>
                <Badge variant={isDevMode ? 'default' : 'secondary'}>{isDevMode ? 'ON' : 'OFF'}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Eye className="mr-2 h-6 w-6" />
            Quick Access
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminPages.map((page) => (
              <Card key={page.href} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`p-2 rounded-lg ${page.color} mr-3`}>
                      <page.icon className="h-5 w-5 text-white" />
                    </div>
                    {page.name}
                  </CardTitle>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={page.href}>Access Page</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-gray-600" />

        {/* Receipt Testing */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Database className="mr-2 h-6 w-6" />
            Receipt Testing
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>View Specific Receipt</CardTitle>
              <CardDescription>Enter a receipt ID to view it directly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="receiptId">Receipt ID</Label>
                  <Input id="receiptId" placeholder="Enter receipt ID..." value={selectedReceiptId} onChange={(e) => setSelectedReceiptId(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button asChild disabled={!selectedReceiptId}>
                    <Link href={`/receipts/${selectedReceiptId}`}>View Receipt</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            System Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <Badge variant="outline">Development</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next.js:</span>
                  <span className="text-sm font-mono">16.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">React:</span>
                  <span className="text-sm font-mono">19.2.0</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Auth:</span>
                  <Badge variant="secondary">NextAuth.js v5</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Database:</span>
                  <Badge variant="secondary">Prisma</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Styling:</span>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Warning */}
        <Card className="mt-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This admin panel bypasses authentication. Only use in development environments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
