import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials

        try {
          const res = await fetch(`${process.env.BACKEND_API_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          if (res.status === 401) {
            throw new Error('Invalid email or password')
          }

          if (res.status === 200 && data.token) {
            return { ...data, role: data.role || 'guest', Stoken: data.token } // Include token in return
          }

          return null
        } catch (e) {
          throw new Error(e.message)
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 10 * 60 * 60 //10hrs
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.accessToken = user.Stoken // Store token in JWT payload
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
        session.accessToken = token.accessToken // Include accessToken in session
      }
      return session
    }
  }
}

export default NextAuth(authOptions)
