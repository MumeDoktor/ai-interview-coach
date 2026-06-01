import { z } from 'zod'

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .trim(),
})

export const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
})

export type TSignUpSchema = z.infer<typeof SignUpSchema>
export type TSignInSchema = z.infer<typeof SignInSchema>