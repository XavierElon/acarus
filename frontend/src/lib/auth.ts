import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log('NextAuth: Attempting backend authentication for:', credentials.email)
          console.log('NextAuth: Backend URL:', process.env.NEXT_PUBLIC_API_URL)

          // Authenticate against backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          console.log('NextAuth: Backend response status:', response.status)

          if (!response.ok) {
            console.error('Backend authentication failed:', response.status)
            console.log('NextAuth: Falling back to mock users')
            return null
          }

          const authData = await response.json()
          console.log('NextAuth: Backend auth data received:', !!authData.user, !!authData.token)

          if (authData.user && authData.token) {
            // Store the backend token for API client use
            if (typeof window !== 'undefined') {
              localStorage.setItem('backend_token', authData.token)
              console.log('NextAuth: Token stored in localStorage')
            }

            console.log('NextAuth: Returning backend user:', authData.user.email)
            return {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.email.split('@')[0], // Use email prefix as name
              role: authData.user.email.includes('admin') ? 'admin' : 'user',
              backendToken: authData.token
            }
          }

          console.log('NextAuth: No valid auth data, falling back to mock users')
          return null
        } catch (error) {
          console.error('Backend authentication error:', error)
          console.log('NextAuth: Falling back to mock users due to error')

          // Fallback to mock users if backend is unavailable
          const mockUsers = [
            {
              id: 'user-1',
              email: 'admin@example.com',
              password: 'admin123',
              name: 'Admin User',
              role: 'admin'
            },
            {
              id: 'user-2',
              email: 'test@example.com',
              password: 'password123',
              name: 'Test User',
              role: 'user'
            },
            {
              id: 'user-3',
              email: 'demo@example.com',
              password: 'demo123',
              name: 'Demo User',
              role: 'user'
            },
            {
              id: 'user-4',
              email: 'john@example.com',
              password: 'john123',
              name: 'John Doe',
              role: 'user'
            },
            {
              id: 'user-5',
              email: 'jane@example.com',
              password: 'jane123',
              name: 'Jane Smith',
              role: 'user'
            }
          ]

          // Find user by email and password
          const user = mockUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

          if (user) {
            console.log('NextAuth: Using mock user:', user.email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }

          console.log('NextAuth: No matching user found in mock users')
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  events: {
    async signIn({ user }: { user: any }) {
      // This runs on both server and client, but we can access localStorage on client
      if (typeof window !== 'undefined' && user?.backendToken) {
        localStorage.setItem('backend_token', user.backendToken)
        localStorage.setItem('auth_token', user.backendToken)
        console.log('NextAuth: Stored token in localStorage from signIn event')
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.backendToken = (user as any).backendToken
        // Store token in localStorage on client side
        if (typeof window !== 'undefined' && (user as any).backendToken) {
          localStorage.setItem('backend_token', (user as any).backendToken)
          localStorage.setItem('auth_token', (user as any).backendToken)
          console.log('NextAuth: Stored token in localStorage from JWT callback')
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    }
  }
})
