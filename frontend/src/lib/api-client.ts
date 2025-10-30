import { ReceiptsQuery, ReceiptsResponse, DashboardStats, Receipt } from '@/types/api'

// Backend API types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    created_at: string
  }
  token: string
}

export interface BackendReceipt {
  id: string
  user_id: string
  vendor_name: string
  total_amount: number
  currency: string
  purchase_date: string
  created_at: string
  updated_at: string
  items: BackendReceiptItem[]
}

export interface BackendReceiptItem {
  id: string
  receipt_id: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface BackendUser {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface BackendReceiptsResponse {
  receipts: BackendReceipt[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface BackendUsersResponse {
  users: BackendUser[]
  total: number
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token') || localStorage.getItem('backend_token')
      console.log('ApiClient: Initialized with token:', !!this.token)
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('backend_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('backend_token')
    }
  }

  // Refresh token from localStorage (useful after login)
  refreshToken() {
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('auth_token')
      const backendToken = localStorage.getItem('backend_token')
      console.log('ApiClient: auth_token:', authToken ? 'present' : 'missing')
      console.log('ApiClient: backend_token:', backendToken ? 'present' : 'missing')
      this.token = authToken || backendToken
      console.log('ApiClient: Token refreshed:', !!this.token)
      if (this.token) {
        console.log('ApiClient: Token (first 50 chars):', this.token.substring(0, 50))
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Always refresh token from localStorage before making request
    this.refreshToken()

    console.log('ApiClient: Making request to URL:', url)
    console.log('ApiClient: Base URL:', this.baseURL)
    console.log('ApiClient: Endpoint:', endpoint)
    console.log('ApiClient: Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    // Add authorization header if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
      console.log('ApiClient: Making request with token to:', endpoint)
    } else {
      console.log('ApiClient: Making request without token to:', endpoint)
      console.log('ApiClient: No token found in localStorage')
    }

    const config: RequestInit = {
      headers,
      ...options
    }

    try {
      const response = await fetch(url, config)

      // Get the response text first (can only be read once)
      const responseText = await response.text()

      if (!response.ok) {
        // Try to parse error details from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = JSON.parse(responseText)
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // If we can't parse JSON, use the response text or default message
          if (responseText) {
            errorMessage = responseText
          }
        }

        // Add helpful context for 404 errors
        if (response.status === 404) {
          console.error('404 Error Details:')
          console.error('- Request URL:', url)
          console.error('- Base URL:', this.baseURL)
          console.error('- Make sure the backend server is running on', this.baseURL)
          console.error('- Check that the endpoint path is correct:', endpoint)
        }

        throw new Error(errorMessage)
      }

      // Parse successful response
      return JSON.parse(responseText)
    } catch (error) {
      console.error('API request failed:', error)
      console.error('API request URL:', url)
      console.error('API request config:', config)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error: Failed to fetch - this usually means:')
        console.error('1. Backend server is not running')
        console.error('2. CORS is not configured properly')
        console.error('3. URL is incorrect')
        console.error('4. Network connectivity issue')
      }
      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // Backend receipt methods
  async getBackendReceipts(
    query: {
      page?: number
      limit?: number
      vendor?: string
      start_date?: string
      end_date?: string
      sort_by?: string
      order?: string
    } = {}
  ): Promise<BackendReceiptsResponse> {
    // Refresh token from localStorage before making request
    this.refreshToken()

    const params = new URLSearchParams()

    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.vendor) params.append('vendor', query.vendor)
    if (query.start_date) params.append('start_date', query.start_date)
    if (query.end_date) params.append('end_date', query.end_date)
    if (query.sort_by) params.append('sort_by', query.sort_by)
    if (query.order) params.append('order', query.order)

    const queryString = params.toString()
    const endpoint = `/receipts${queryString ? `?${queryString}` : ''}`

    return this.request<BackendReceiptsResponse>(endpoint)
  }

  async getBackendReceipt(id: string): Promise<BackendReceipt> {
    return this.request<BackendReceipt>(`/receipts/${id}`)
  }

  async getBackendUsers(): Promise<BackendUsersResponse> {
    return this.request<BackendUsersResponse>('/users')
  }

  // Convert backend receipt to frontend format
  private convertBackendReceipt(backendReceipt: BackendReceipt): Receipt {
    return {
      id: backendReceipt.id,
      merchant: backendReceipt.vendor_name,
      total: backendReceipt.total_amount,
      date: backendReceipt.purchase_date,
      category: 'General', // Default category since backend doesn't have this
      items: backendReceipt.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.unit_price,
        quantity: item.quantity,
        category: 'General'
      })),
      createdAt: backendReceipt.created_at,
      updatedAt: backendReceipt.updated_at
    }
  }

  // Frontend-compatible methods that use backend
  async getReceipts(query: ReceiptsQuery = {}): Promise<ReceiptsResponse> {
    try {
      // Refresh token from localStorage before making request
      this.refreshToken()

      // Try to get receipts from backend first
      const backendQuery = {
        page: query.page || 1,
        limit: query.limit || 10,
        vendor: query.merchant,
        start_date: query.startDate,
        end_date: query.endDate,
        sort_by: query.sortBy === 'date' ? 'purchase_date' : query.sortBy,
        order: query.sortOrder || 'desc'
      }

      const backendResponse = await this.getBackendReceipts(backendQuery)

      const receipts = backendResponse.receipts.map((receipt) => this.convertBackendReceipt(receipt))

      return {
        receipts,
        total: backendResponse.total,
        page: backendResponse.page,
        limit: backendResponse.limit,
        totalPages: backendResponse.total_pages
      }
    } catch (error) {
      console.error('Failed to fetch receipts from backend, returning empty results:', error)

      // Return empty results instead of falling back to non-existent frontend API
      return {
        receipts: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: 0
      }
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Since the backend doesn't have a dashboard stats endpoint,
    // we'll compute stats from receipts client-side
    try {
      const receiptsResponse = await this.getBackendReceipts({ limit: 1000 })

      const receipts = receiptsResponse.receipts
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Calculate stats from receipts
      const totalReceipts = receipts.length
      const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0)
      const averageReceipt = totalReceipts > 0 ? totalSpent / totalReceipts : 0

      // Receipts this month
      const receiptsThisMonth = receipts.filter((receipt) => {
        const purchaseDate = new Date(receipt.purchase_date)
        return purchaseDate >= startOfMonth
      }).length

      // Top categories (simple count)
      const categoryCounts: Record<string, number> = {}
      receipts.forEach((receipt) => {
        // Since backend doesn't have categories, we'll create a dummy category
        const category = 'General'
        categoryCounts[category] = (categoryCounts[category] || 0) + receipt.total_amount
      })

      const topCategories = Object.entries(categoryCounts)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)

      // Recent receipts (convert to frontend format)
      const recentReceipts = receipts
        .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
        .slice(0, 5)
        .map((receipt) => this.convertBackendReceipt(receipt))

      return {
        totalReceipts,
        totalSpent,
        averageReceipt,
        receiptsThisMonth,
        topCategories,
        recentReceipts
      }
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      // Return empty stats on error
      return {
        totalReceipts: 0,
        totalSpent: 0,
        averageReceipt: 0,
        receiptsThisMonth: 0,
        topCategories: [],
        recentReceipts: []
      }
    }
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
