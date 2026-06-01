'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { signup, type TAuthState } from '@/actions/authActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'

export default function SignUpForm() {
  const [state, action, pending] = useActionState<TAuthState, FormData>(signup, undefined)

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          autoComplete="name"
          aria-invalid={!!state?.errors?.name}
        />
        {state?.errors?.name && (
          <p className="text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!state?.errors?.email}
        />
        {state?.errors?.email && (
          <p className="text-xs text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!state?.errors?.password}
        />
        {state?.errors?.password ? (
          <ul className="space-y-0.5">
            {state.errors.password.map((err) => (
              <li key={err} className="text-xs text-destructive">{err}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Min. 8 characters with a letter and a number.
          </p>
        )}
      </div>

      {state?.message && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {pending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}