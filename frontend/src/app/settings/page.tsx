'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, Bell, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your application preferences</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input type="text" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background" placeholder="your@email.com" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly reports</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monthly summaries</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <Button>Update Preferences</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Two-Factor Authentication
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Application Settings
              </CardTitle>
              <CardDescription>Configure application preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark mode</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-save receipts</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show receipts in calendar</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
