'use client'

import { useReceipts } from '@/hooks/use-receipts'
import { ReceiptsQuery } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'

interface ReceiptsListProps {
  filters: ReceiptsQuery
}

export function ReceiptsList({ filters }: ReceiptsListProps) {
  const { data, isLoading, error } = useReceipts(filters)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading receipts: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data?.receipts?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No receipts found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {data.receipts.map((receipt) => (
        <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{receipt.merchant}</CardTitle>
                <CardDescription>{new Date(receipt.date).toLocaleDateString()}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{receipt.category}</Badge>
                <span className="text-lg font-semibold">${receipt.total.toFixed(2)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href={`/receipts/${receipt.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
