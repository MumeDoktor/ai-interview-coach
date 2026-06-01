import SignInForm from './_components/SignInForm'

export const metadata = {
  title: 'Sign in — AI Interview Coach',
}

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue your interview prep
        </p>
      </div>
      <SignInForm />
    </div>
  )
}