'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

interface ReceiptDetailPageProps {
  params: {
    id: string
  }
}

export default function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const { id } = params

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/receipts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Receipts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Receipt Details</h1>
              <p className="text-muted-foreground">Receipt ID: {id}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receipt Information</CardTitle>
            <CardDescription>Detailed view of receipt {id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">Receipt detail functionality will be implemented here.</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/receipts/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Add New Receipt
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
