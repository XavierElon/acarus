'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/hooks/use-auth'
import { ReceiptsList } from '@/components/receipts/receipts-list'
import { ReceiptsFilters } from '@/components/receipts/receipts-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ReceiptsQuery } from '@/types/api'

export default function ReceiptsPage() {
  const [filters, setFilters] = useState<ReceiptsQuery>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const { isLoading: authLoading } = useAuth()

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
            <p className="text-muted-foreground">Manage and view all your receipts</p>
          </div>
          <Button asChild>
            <Link href="/receipts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Receipt
            </Link>
          </Button>
        </div>

        <ReceiptsFilters filters={filters} onFiltersChange={setFilters} />

        <ReceiptsList filters={filters} />
      </div>
    </MainLayout>
  )
}
