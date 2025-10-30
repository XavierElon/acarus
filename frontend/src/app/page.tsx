'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { Receipt, TrendingUp, Shield, BarChart3, Sparkles, Zap, Camera, CheckCircle, Building2, Users, Briefcase, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the landing page if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dotted Glow Background */}
      <DottedGlowBackground className="pointer-events-none" opacity={0.15} gap={15} radius={1.5} glowColorLightVar="--color-neutral-600" glowColorDarkVar="--color-purple-400" backgroundOpacity={0} speedMin={0.5} speedMax={2} speedScale={0.5} />

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Background graphics */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Floating orbs with parallax */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000" style={{ transform: `translateY(${scrollY * 0.4}px)` }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center mb-16 z-10">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-full mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm text-purple-300">Powered by AI Technology</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Track Your Receipts
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Effortlessly</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">Upload, organize, and analyze your receipts with our powerful receipt management system.</p>

          {/* Visual demo preview */}
          <div className="relative mb-12 animate-fade-in-up delay-400">
            <div className="relative inline-block animate-float">
              {/* Dashboard preview mockup */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 p-8 backdrop-blur hover:border-purple-400/50 transition-all duration-300">
                {/* Mock chart */}
                <div className="flex items-end justify-center gap-2 h-32 mb-4">
                  {[60, 80, 45, 90, 70, 85].map((height, i) => (
                    <div key={i} className="w-8 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ height: `${height}%`, animation: `fade-in-up 0.6s ease-out ${i * 100}ms forwards` }} />
                  ))}
                </div>
                {/* Mock receipts */}
                <div className="flex gap-2 justify-center">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-16 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 hover:scale-105 hover:border-purple-400/50 transition-all duration-300" style={{ animation: `fade-in-up 0.6s ease-out ${i * 150 + 600}ms forwards` }} />
                  ))}
                </div>
              </div>

              {/* Floating icons with enhanced animations */}
              <div className="absolute -top-4 -left-4 bg-purple-500 p-3 rounded-full shadow-lg animate-bounce hover:scale-110 transition-transform cursor-pointer group">
                <Camera className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-500 p-3 rounded-full shadow-lg animate-bounce hover:scale-110 transition-transform cursor-pointer group delay-300" style={{ animationDelay: '300ms' }}>
                <BarChart3 className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 p-3 rounded-full shadow-lg animate-bounce hover:scale-110 transition-transform cursor-pointer group delay-500" style={{ animationDelay: '500ms' }}>
                <CheckCircle className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center animate-fade-in-up delay-600">
            <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-2 hover:bg-white/10 transition-all duration-300">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="relative grid md:grid-cols-3 gap-8 max-w-6xl mx-auto z-10">
          <Card className="bg-white/10 backdrop-blur border-white/20 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 group">
            <CardHeader>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <Receipt className="h-12 w-12 text-purple-400 relative animate-pulse group-hover:animate-none" />
              </div>
              <CardTitle className="text-white text-xl mt-4">Smart OCR</CardTitle>
              <CardDescription className="text-gray-300 text-sm mt-2">Automatically extract data from receipt images using advanced OCR technology. Just snap and scan!</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 group">
            <CardHeader>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <BarChart3 className="h-12 w-12 text-blue-400 relative animate-pulse group-hover:animate-none" />
              </div>
              <CardTitle className="text-white text-xl mt-4">Analytics</CardTitle>
              <CardDescription className="text-gray-300 text-sm mt-2">Track your spending with detailed analytics and visual reports. See your financial patterns at a glance.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 group">
            <CardHeader>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <Shield className="h-12 w-12 text-green-400 relative animate-pulse group-hover:animate-none" />
              </div>
              <CardTitle className="text-white text-xl mt-4">Secure</CardTitle>
              <CardDescription className="text-gray-300 text-sm mt-2">Your data is encrypted and securely stored in the cloud. Enterprise-grade security for peace of mind.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="relative mt-32 mb-20 z-10">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center animate-fade-in-up delay-400">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">10K+</div>
              <div className="text-gray-400 text-sm">Receipts Processed</div>
            </div>
            <div className="text-center animate-fade-in-up delay-500">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-gray-400 text-sm">OCR Accuracy</div>
            </div>
            <div className="text-center animate-fade-in-up delay-600">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">&lt;2s</div>
              <div className="text-gray-400 text-sm">Processing Time</div>
            </div>
            <div className="text-center animate-fade-in-up delay-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Available</div>
            </div>
          </div>
        </div>

        {/* Business Section */}
        <div className="relative mt-32 mb-20 z-10">
          <div className="max-w-6xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full mb-6">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300">Built for Businesses</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Streamline Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Expense Management</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">Save time and reduce errors with automated receipt processing. Perfect for teams of all sizes.</p>
            </div>

            {/* Use Cases Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Use Case 1 */}
              <Card className="bg-white/5 backdrop-blur border-white/10 hover:border-blue-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group animate-scale-in" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                  <div className="relative w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all">
                    <DollarSign className="h-7 w-7 text-blue-400 group-hover:animate-spin" style={{ animationDuration: '1s' }} />
                  </div>
                  <CardTitle className="text-white text-xl">Accounting Teams</CardTitle>
                  <CardDescription className="text-gray-300 mt-2">Automate expense reporting and reconciliation. Reduce manual data entry by up to 90% and minimize human error.</CardDescription>
                </CardHeader>
              </Card>

              {/* Use Case 2 */}
              <Card className="bg-white/5 backdrop-blur border-white/10 hover:border-purple-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group animate-scale-in" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                  <div className="relative w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all">
                    <Briefcase className="h-7 w-7 text-purple-400 group-hover:animate-bounce" />
                  </div>
                  <CardTitle className="text-white text-xl">Small Businesses</CardTitle>
                  <CardDescription className="text-gray-300 mt-2">Keep track of all business expenses effortlessly. Get insights into spending patterns and make data-driven decisions.</CardDescription>
                </CardHeader>
              </Card>

              {/* Use Case 3 */}
              <Card className="bg-white/5 backdrop-blur border-white/10 hover:border-green-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group animate-scale-in" style={{ animationDelay: '300ms' }}>
                <CardHeader>
                  <div className="relative w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 group-hover:scale-110 transition-all">
                    <Users className="h-7 w-7 text-green-400 group-hover:scale-125 transition-transform" />
                  </div>
                  <CardTitle className="text-white text-xl">Travel & Hospitality</CardTitle>
                  <CardDescription className="text-gray-300 mt-2">Manage employee expense claims efficiently. Process receipts from hotels, restaurants, and transportation instantly.</CardDescription>
                </CardHeader>
              </Card>

              {/* Use Case 4 */}
              <Card className="bg-white/5 backdrop-blur border-white/10 hover:border-pink-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group animate-scale-in" style={{ animationDelay: '400ms' }}>
                <CardHeader>
                  <div className="relative w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-all">
                    <Receipt className="h-7 w-7 text-pink-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Real Estate</CardTitle>
                  <CardDescription className="text-gray-300 mt-2">Organize property-related expenses, maintenance costs, and contractor invoices in one centralized location.</CardDescription>
                </CardHeader>
              </Card>

              {/* Use Case 5 */}
              <Card className="bg-white/5 backdrop-blur border-white/10 hover:border-orange-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group animate-scale-in" style={{ animationDelay: '500ms' }}>
                <CardHeader>
                  <div className="relative w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-all">
                    <BarChart3 className="h-7 w-7 text-orange-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Financial Services</CardTitle>
                  <CardDescription className="text-gray-300 mt-2">Quick expense categorization and reporting. Generate compliance-ready financial reports in minutes.</CardDescription>
                </CardHeader>
              </Card>

              {/* Use Case 6 */}
              <Card className="bg-white/5 backdrop-blur border-white/10 hover:border-indigo-400/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group animate-scale-in" style={{ animationDelay: '600ms' }}>
                <CardHeader>
                  <div className="relative w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-all">
                    <Zap className="h-7 w-7 text-indigo-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Any Industry</CardTitle>
                  <CardDescription className="text-gray-300 mt-2">Flexible platform that adapts to your workflow. API access available for custom integrations.</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center animate-fade-in-up delay-800">
              <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-8 backdrop-blur hover:border-purple-400/50 transition-all duration-300 relative overflow-hidden group">
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
                <h3 className="text-2xl font-bold text-white mb-3">Ready to Transform Your Expense Management?</h3>
                <p className="text-gray-300 mb-6">Join thousands of businesses already using our platform</p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Link href="/auth/register">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-2 hover:bg-white/10 transition-all duration-300">
                    <Link href="/auth/login">Schedule Demo</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 relative z-10">
        <p>© 2026 Acarus. All rights reserved.</p>
      </footer>
    </div>
  )
}
