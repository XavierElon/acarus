'use client'

import { useState } from 'react'
import { ReceiptsQuery } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReceiptsFiltersProps {
  filters: ReceiptsQuery
  onFiltersChange: (filters: ReceiptsQuery) => void
}

export function ReceiptsFilters({ filters, onFiltersChange }: ReceiptsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: keyof ReceiptsQuery, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="merchant">Merchant</Label>
          <Input id="merchant" placeholder="Search by merchant..." value={localFilters.merchant || ''} onChange={(e) => handleFilterChange('merchant', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="Search by category..." value={localFilters.category || ''} onChange={(e) => handleFilterChange('category', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="sortBy">Sort By</Label>
          <select id="sortBy" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={localFilters.sortBy || 'date'} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
            <option value="date">Date</option>
            <option value="total">Total</option>
            <option value="merchant">Merchant</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const resetFilters = { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' }
            setLocalFilters(resetFilters)
            onFiltersChange(resetFilters)
          }}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
