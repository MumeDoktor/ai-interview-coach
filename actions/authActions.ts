'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { SignUpSchema, SignInSchema } from '@/lib/validations'

export type TAuthState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined

export async function signup(state: TAuthState, formData: FormData): Promise<TAuthState> {
  const parsed = SignUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { errors: { email: ['An account with this email already exists.'] } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, email, password: hashedPassword },
  })

  await signIn('credentials', { email, password, redirectTo: '/dashboard' })
}

export async function login(state: TAuthState, formData: FormData): Promise<TAuthState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return { message: 'Invalid email or password.' }
      }
      return { message: 'Something went wrong. Please try again.' }
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: '/sign-in' })
}