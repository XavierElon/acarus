'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
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
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">Advanced analytics and reporting</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Spending Trends
              </CardTitle>
              <CardDescription>Monthly spending analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics charts will be implemented here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Category Breakdown
              </CardTitle>
              <CardDescription>Spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Category analytics will be implemented here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download your data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
