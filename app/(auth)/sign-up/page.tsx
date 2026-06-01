import SignUpForm from './_components/SignUpForm'

export const metadata = {
  title: 'Create account — AI Interview Coach',
}

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Start practising for free — no credit card required
        </p>
      </div>
      <SignUpForm />
    </div>
  )
}