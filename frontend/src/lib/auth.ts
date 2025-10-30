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

          console.log('NextAuth: No valid auth data')
          return null
        } catch (error) {
          console.error('Backend authentication error:', error)
          // Authentication failed - return null (no mock fallback)
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
