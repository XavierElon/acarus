'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

export default function NewReceiptPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Receipt</h1>
            <p className="text-muted-foreground">Add a new receipt to your collection</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receipt Form</CardTitle>
            <CardDescription>Enter the details of your receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">Receipt form functionality will be implemented here.</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/receipts">
                    <FileText className="mr-2 h-4 w-4" />
                    View All Receipts
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
