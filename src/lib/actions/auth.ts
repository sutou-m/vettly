'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/src/lib/auth'
import { supabaseAdmin } from '@/src/lib/supabase'

type AuthState = { error?: string } | undefined

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '全項目を入力してください' }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    throw error
  }
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: '全項目を入力してください' }
  }

  if (password.length < 8) {
    return { error: 'パスワードは8文字以上で入力してください' }
  }

  const { data: existing } = await supabaseAdmin
    .from('vet_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return { error: 'このメールアドレスは既に登録されています' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const { error } = await supabaseAdmin
    .from('vet_users')
    .insert({ name, email, auth_password: hashedPassword })

  if (error) {
    return { error: 'アカウント作成に失敗しました' }
  }

  redirect('/login')
}

export async function logout() {
  await signOut({ redirectTo: '/login' })
}
