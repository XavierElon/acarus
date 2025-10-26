import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ReceiptsQuery, ReceiptsResponse, DashboardStats } from '@/types/api'

export function useReceipts(query: ReceiptsQuery = {}) {
  return useQuery<ReceiptsResponse>({
    queryKey: ['receipts', query],
    queryFn: () => apiClient.getReceipts(query),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
