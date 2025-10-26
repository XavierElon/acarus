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

        // Mock users for testing
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
        const user = mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
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
