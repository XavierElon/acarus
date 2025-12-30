'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { useDashboardStats } from '@/hooks/use-receipts'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Receipt, DollarSign, TrendingUp, Calendar, Plus, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PageTransition } from '@/components/animations/page-transition'
import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'
import { motion } from 'framer-motion'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { isLoading: authLoading } = useAuth()

  // Show loading while auth is being checked or data is loading
  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </PageTransition>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your receipts.</p>
              </div>
              <Button asChild>
                <Link href="/receipts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Receipt
                </Link>
              </Button>
            </div>
          </FadeIn>

          {/* Stats Cards with Stagger Animation */}
          <StaggerChildren>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StaggerItem>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalReceipts || 0}</div>
                    <p className="text-xs text-muted-foreground">All time receipts</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats?.totalSpent?.toFixed(2) || '0.00'}</div>
                    <p className="text-xs text-muted-foreground">Total amount spent</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Receipt</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats?.averageReceipt?.toFixed(2) || '0.00'}</div>
                    <p className="text-xs text-muted-foreground">Per receipt average</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.receiptsThisMonth || 0}</div>
                    <p className="text-xs text-muted-foreground">Receipts this month</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </StaggerChildren>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <FadeIn delay={0.2}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Your spending breakdown this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.topCategories?.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={stats.topCategories} cx="50%" cy="50%" labelLine={false} label={({ category, total }: any) => `${category}: $${total.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="total">
                          {stats.topCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">No category data available</div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Monthly Spending Trend</CardTitle>
                  <CardDescription>Your spending over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { month: 'Jul', amount: 1200 },
                        { month: 'Aug', amount: 1500 },
                        { month: 'Sep', amount: 1800 },
                        { month: 'Oct', amount: 1600 },
                        { month: 'Nov', amount: 1400 },
                        { month: 'Dec', amount: 2000 }
                      ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Recent Receipts */}
          <FadeIn delay={0.4}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Receipts</CardTitle>
                  <CardDescription>Your latest receipt entries</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/receipts">
                    View All
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stats?.recentReceipts?.length ? (
                  <div className="space-y-4">
                    {stats.recentReceipts.map((receipt, index) => (
                      <motion.div key={receipt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{receipt.merchant}</p>
                          <p className="text-xs text-muted-foreground">{new Date(receipt.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{receipt.category}</Badge>
                          <span className="text-sm font-medium">${receipt.total.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">No recent receipts found.</p>
                    <Button asChild>
                      <Link href="/receipts/new">Add your first receipt</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </PageTransition>
    </MainLayout>
  )
}
