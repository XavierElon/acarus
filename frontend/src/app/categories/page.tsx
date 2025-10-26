'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CategoriesPage() {
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
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground">Manage your receipt categories</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Food & Dining
              </CardTitle>
              <CardDescription>Restaurants, groceries, and food expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Transportation
              </CardTitle>
              <CardDescription>Gas, parking, and travel expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Shopping
              </CardTitle>
              <CardDescription>Retail purchases and online shopping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
