import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/src/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null

        const { data: user } = await supabaseAdmin
          .from('vet_users')
          .select('id, email, name, auth_password')
          .eq('email', email)
          .single()

        if (!user) return null

        const passwordMatch = await bcrypt.compare(password, user.auth_password)
        if (!passwordMatch) return null

        return { id: user.id, email: user.email, name: user.name ?? '' }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
