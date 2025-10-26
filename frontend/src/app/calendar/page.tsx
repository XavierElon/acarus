'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CalendarPage() {
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
              <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
              <p className="text-muted-foreground">Calendar view of your receipts</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Receipt Calendar
            </CardTitle>
            <CardDescription>View your receipts in a calendar format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">Calendar functionality will be implemented here.</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/receipts">View Receipts List</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/receipts/new">Add New Receipt</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
