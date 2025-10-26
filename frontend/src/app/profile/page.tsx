'use client'

import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { PageTransition } from '@/components/animations/page-transition'
import { FadeIn } from '@/components/animations/fade-in'
import { User, Mail, Calendar, Shield, LogOut, Settings, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { user, isDevMode } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const currentUser = session?.user || user

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </FadeIn>

          {/* Profile Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Your basic account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{currentUser?.name || 'User'}</h3>
                      <p className="text-muted-foreground">{currentUser?.email}</p>
                      {isDevMode && (
                        <Badge variant="secondary" className="mt-1">
                          Development Mode
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">User ID</p>
                        <p className="text-sm text-muted-foreground font-mono">{currentUser?.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">{isDevMode ? 'Development Mode' : 'Recently'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy & Security
                  </Button>

                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Statistics */}
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your activity and usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Total Receipts</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Categories Used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Development Mode Info */}
          {isDevMode && (
            <FadeIn delay={0.4}>
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">🚧 Development Mode Active</CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">You are currently using the application in development mode with authentication bypassed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">This is a mock user session for testing purposes. In production, this would be a real user account.</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </MainLayout>
  )
}
