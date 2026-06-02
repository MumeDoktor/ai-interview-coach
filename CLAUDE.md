@AGENTS.md

# CLAUDE.md — AI Interview Coach

> This file defines the conventions, architecture rules, and best practices for this project.
> Every contributor (human or AI) must follow these guidelines to maintain a stable, scalable, and maintainable codebase.

---

## 🗂 Project Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 + Shadcn/ui (base-ui primitives) |
| Auth | Auth.js v5 (`next-auth@beta`) — JWT strategy, Credentials provider |
| Database | PostgreSQL via Docker |
| ORM | Prisma 6 |
| Validation | Zod v4 |

## 🏗 As-built File Structure

The project uses a **root-level `app/`** directory (no `src/` wrapper). All shared code lives at the root alongside `app/`.

```
app/
  (auth)/
    layout.tsx                    # Split-panel layout: dark brand panel | form card
    sign-in/
      page.tsx
      _components/SignInForm.tsx
    sign-up/
      page.tsx
      _components/SignUpForm.tsx
  _components/                    # Landing page client components (route-scoped)
    RoleCycler.tsx                #   Animated role name cycler (fade transition)
    MockInterviewCard.tsx         #   Static chat-style interview mockup
    AudioCallCard.tsx             #   Live voice call mockup — waveform animation
    JobAnalysisCard.tsx           #   Job analysis report — topic bars, HR style, culture tags
  api/auth/[...nextauth]/route.ts
  dashboard/
    layout.tsx                    # RSC — reads session, guards route, renders Sidebar
    page.tsx                      # RSC — welcome header, stats row, feature cards, empty sessions
    _components/
      Sidebar.tsx                 # Client — sticky desktop nav + mobile top bar + logout form
  layout.tsx                      # Root layout — Geist font, globals.css
  page.tsx                        # Marketing home page (RSC)

actions/
  authActions.ts                  # signup · login · logout server actions

components/
  ui/                             # Shadcn primitives: Button, Input, Label, Card, PasswordInput
  shared/                         # Composite components (none yet)

lib/
  auth.config.ts                  # Edge-safe auth config — session strategy, pages, authorized cb
  auth.ts                         # Full auth config — Credentials provider + Prisma lookups
  db.ts                           # Prisma client singleton (server-only)
  env.ts                          # Typed + validated ENV wrapper (server-only)
  validations.ts                  # Zod schemas: SignUpSchema, SignInSchema
  utils.ts                        # cn() helper (clsx + tailwind-merge)

prisma/
  schema.prisma                   # User model (id, name, email, password, timestamps)
prisma.config.ts                  # Prisma 6 config (datasource, migration path)

proxy.ts                          # Route protection — Next.js 16's middleware.ts replacement
docker-compose.yml                # PostgreSQL 16 on port 5432
```

## 🗺 Feature Roadmap & Status

| Feature | Status | Notes |
|---|---|---|
| Auth (sign-up / sign-in / sign-out) | ✅ Shipped | JWT, bcrypt, server actions |
| Landing page | ✅ Shipped | Hero, 3 features, job analysis section, voice section, how-it-works, CTA |
| Dashboard shell | ✅ Shipped | Sidebar nav, stats row, feature cards, empty sessions |
| Practice sessions | 🔜 Next | Scaffolded as "Coming soon" in dashboard |
| Job analysis feature | 🔜 Next | Scaffolded as "Coming soon" in dashboard |
| Voice interview (Premium) | 🔜 Later | Scaffolded as "Coming soon · Pro" in dashboard |

When building new features, wire the dashboard `Sidebar` nav item (remove `soon: true`) and create the route under `app/dashboard/[feature-name]/`.

## 🐳 Dev Environment

Start the database before running the dev server:
```bash
docker compose up -d
npm run dev
```

Credentials (local only): `postgresql://postgres:postgres@localhost:5432/ai_interview_coach`

## 🎨 Visual Design Language

The app uses `bg-zinc-950` as the global dark base. Accent colors signal feature tiers consistently across landing page and dashboard — never mix these associations:

| Accent | Tailwind prefix | Used for |
|---|---|---|
| Violet | `violet-*` | Core product, primary CTAs, active nav state |
| Teal | `teal-*` | Job/company/HR intelligence feature |
| Amber | `amber-*` | Premium / Pro tier (voice interview) |
| Emerald | `emerald-*` | Success states, live/online indicators |

**Landing page sections** follow an alternating card layout (card-right for job analysis, card-left for voice) to create visual rhythm. Keep this pattern when adding new feature sections.

**Dashboard** uses `bg-zinc-900` for the sidebar and `bg-zinc-950` for the main content area — matching the auth brand panel color.

## 🧩 UI Component Patterns

### Button vs Link

The `Button` component is built on `@base-ui/react/button` and does **not** support the `asChild` / Radix `Slot` pattern. Putting `<Button>` inside `<Link>` produces invalid DOM (`<button>` inside `<a>`).

```tsx
// ✅ Navigation CTAs — use a styled <Link> directly
<Link
  href="/sign-up"
  className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-8 text-base font-medium text-white transition-colors hover:bg-violet-500"
>
  Get started
</Link>

// ✅ Form submits — use <Button> (renders a real <button>)
<Button type="submit" size="lg" className="w-full">Sign in</Button>

// ❌ Never nest Button inside Link
<Link href="/sign-up"><Button>Get started</Button></Link>
```

### Sign-out in client components

Use a `<form action={logout}>` to call the server action — no `useRouter` or `onClick` needed:

```tsx
'use client'
import { logout } from '@/actions/authActions'

<form action={logout}>
  <button type="submit">Sign out</button>
</form>
```

### Non-clickable nav items ("Coming soon")

Render `<div>` instead of `<Link>` for disabled nav entries so there is no href to accidentally navigate to:

```tsx
{soon ? (
  <div className="... cursor-not-allowed opacity-40">{inner}</div>
) : (
  <Link href={href} className="...">{inner}</Link>
)}
```

## 🔐 Auth Architecture

Auth.js v5 uses a **split-config** pattern to avoid importing Prisma into the Edge proxy:

- `lib/auth.config.ts` — session strategy, pages, `authorized` callback. No providers, no Prisma. Safe for Edge.
- `lib/auth.ts` — spreads `authConfig` + adds the Credentials provider with Prisma lookups. Node.js only.
- `proxy.ts` — imports **only** from `auth.config.ts` via `NextAuth(authConfig)`.
- `app/api/auth/[...nextauth]/route.ts` — imports from `auth.ts` (full config).

Sign-up is a plain Server Action (`actions/authActions.ts`) that hashes the password with bcrypt, creates the user in Prisma, then calls `signIn()`.

---

## 🏢 Casing & Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Routing & feature folders | `kebab-case` | `user-profile/`, `shopping-cart/` |
| React components | `PascalCase` | `SubmitButton.tsx`, `UserProfile.tsx` |
| Custom hooks | `camelCase` prefixed with `use` | `useAuth.ts`, `useCartItems.ts` |
| Utility functions | `camelCase` | `formatDate.ts`, `parseQueryString.ts` |
| Server Actions files | `camelCase` suffixed with `actions` | `cartActions.ts`, `userActions.ts` |
| TypeScript types/interfaces | `PascalCase` prefixed with `T` or `I` | `TUser`, `IApiResponse` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Dynamic route params | Descriptive `kebab-case` | `[userId]`, `[productSlug]` (not `[id]`) |
| ENV variables (private) | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `AUTH_SECRET` |
| ENV variables (public) | prefixed with `NEXT_PUBLIC_` | `NEXT_PUBLIC_APP_URL` |

---

## 📁 Project Architecture & File Colocation

```
src/
├── app/                          # Routing tier — Next.js route files only
│   ├── (marketing)/              # Route Group — does not create a URL segment
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── _components/          # Route-scoped components (not exposed as routes)
│   │   │   └── DashboardChart.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── layout.tsx                # Root layout
│   ├── global-error.tsx          # Global error boundary
│   └── not-found.tsx
│
├── components/                   # Global, reusable UI primitives
│   ├── ui/                       # Shadcn UI / headless components
│   └── shared/                   # Composite components (consume ui/)
│
├── lib/                          # Global configurations and clients
│   ├── db.ts                     # Database client
│   ├── auth.ts                   # Auth configuration
│   └── env.ts                    # Typed & validated ENV variables
│
├── hooks/                        # Global custom hooks
├── types/                        # Global TypeScript types
├── utils/                        # Pure utility functions
└── actions/                      # Global Server Actions
```

### Rules for the `/app` directory

- `page.tsx` → Publicly accessible route content
- `layout.tsx` → Persistent UI shared across sub-routes
- `loading.tsx` → Automatic streaming/skeleton
- `error.tsx` → Custom error boundary (**must be a Client Component**)
- `not-found.tsx` → 404 page

**Route Isolation:** A folder prefixed with `_` (e.g. `_components`) inside `/app` does not become a public route. An alternative is Route Groups with `(name)`.

---

## 🚀 Data Fetching & Server Components

### Server-First approach

```tsx
// ✅ Default — leave as RSC
export default async function ProductList() {
  const products = await fetchProducts() // fetch directly in the component
  return <ul>{products.map(p => <ProductCard key={p.id} product={p} />)}</ul>
}

// ✅ "use client" ONLY when you need interactivity
'use client'
import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  // ...
}
```

### Fetch at the leaf component level

```tsx
// ❌ Anti-pattern — massive prop chain from root layout
// layout.tsx → page.tsx → Section.tsx → Card.tsx → Button.tsx

// ✅ Each RSC fetches its own data
// Next.js automatically deduplicates identical fetch calls
async function UserAvatar({ userId }: { userId: string }) {
  const user = await getUser(userId) // automatically deduped
  return <img src={user.avatarUrl} alt={user.name} />
}
```

### Server / Client boundary — Children as Slot pattern

```tsx
// ✅ Server Component fetches, Client Component handles interaction
// ServerPage.tsx (RSC)
export default async function Page() {
  const data = await fetchData()
  return (
    <InteractiveShell> {/* Client Component */}
      <ServerContent data={data} /> {/* RSC passed as children */}
    </InteractiveShell>
  )
}

// InteractiveShell.tsx
'use client'
export function InteractiveShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <div onClick={() => setOpen(!open)}>{children}</div>
}
```

**Rule:** Keep the `"use client"` boundary as deep in the component tree as possible.

### Server Actions

```ts
// actions/cartActions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const AddToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
})

export async function addToCart(formData: FormData) {
  const parsed = AddToCartSchema.safeParse({
    productId: formData.get('productId'),
    quantity: Number(formData.get('quantity')),
  })

  if (!parsed.success) {
    return { success: false, error: 'validation_failed', details: parsed.error.flatten() }
  }

  // ... DB logic

  revalidatePath('/cart')
  return { success: true }
}
```

**Server Actions rules:**
- Always validate input with `Zod` on the server side
- Return a typed result object instead of throwing for expected error cases
- Use `revalidatePath` / `revalidateTag` for cache invalidation

### Isolation Guardrails

```ts
// lib/db.ts — prevents accidental import into Client Components
import 'server-only'

import { PrismaClient } from '@prisma/client'
export const db = new PrismaClient()
```

---

## 🔐 Security & Environment Variables

### Typed ENV wrapper with Zod validation

```ts
// lib/env.ts
import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  // Private — server only
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  // Public — browser safe
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)
// Throws at build time if ENV is invalid — fail fast
```

**Never read `process.env` directly** in components or action files. Always import through the `env` wrapper.

### HTTP Security Headers

```ts
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...`,
  },
]

export default {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

---

## 📝 TypeScript Discipline

```ts
// ❌ Never any
function processData(data: any) { ... }

// ✅ unknown + type guard
function processData(data: unknown) {
  if (isValidData(data)) { ... }
}

// ✅ satisfies — type checking without widening
const config = {
  theme: 'dark',
  lang: 'en',
} satisfies AppConfig

// ✅ Zod for runtime validation of API responses
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
})

type User = z.infer<typeof UserSchema> // type derived from Zod schema

const user = UserSchema.parse(await response.json()) // runtime validated
```

### `tsconfig.json` — current state

The repo currently only has `"strict": true`. The stricter options below are recommended but **not yet enabled** — enable them intentionally and fix the resulting type errors before shipping:

```json
{
  "compilerOptions": {
    "strict": true,

    // Not yet enabled — add when ready:
    // "noUncheckedIndexedAccess": true,   // array[i] becomes T | undefined
    // "exactOptionalPropertyTypes": true  // { x?: string } ≠ { x: string | undefined }
  }
}
```

Until `noUncheckedIndexedAccess` is on, treat array/object indexing defensively anyway (use `?? fallback`) so enabling it later causes zero surprises.

---

## ⚡ Performance & Bundle Optimization

### Dynamic Import

```tsx
import dynamic from 'next/dynamic'

// ✅ Heavy components not needed on first render
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false, // for components that depend on browser APIs
})

const ChartDashboard = dynamic(() => import('@/components/ChartDashboard'), {
  loading: () => <ChartSkeleton />,
})
```

### Font & Script optimization

```tsx
// app/layout.tsx

// ✅ next/font — automatic self-hosting, eliminates layout shift
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// ✅ next/script — for third-party scripts
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
```

### Import rules

```ts
// ❌ Import the entire library
import * as dateFns from 'date-fns'
import _ from 'lodash'

// ✅ Destructure only what you need
import { format, parseISO } from 'date-fns'
import { debounce } from 'lodash-es'
```

---

## 🛠️ SEO & Core Optimizations

### Metadata API

```tsx
// app/products/[productSlug]/page.tsx
import type { Metadata } from 'next'

// Static metadata
export const metadata: Metadata = {
  title: 'Our Shop',
  description: 'Page description',
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { productSlug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.productSlug)
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.imageUrl],
    },
  }
}
```

### Next.js Core Elements

```tsx
// ❌ Never use native HTML tags for navigation and images
<a href="/about">About</a>
<img src="/hero.jpg" alt="Hero" />

// ✅ Always use next/link and next/image
import Link from 'next/link'
import Image from 'next/image'

<Link href="/about" prefetch>About</Link>
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // for above-the-fold images
  placeholder="blur"
/>
```

---

## 🔄 State Management Hierarchy

Ask yourself in order — stop at the first option that's sufficient:

```
1. URL state          → useSearchParams + nuqs  (filters, pagination, tabs)
2. Server state       → TanStack Query / RSC     (async API data)
3. Local UI state     → useState / useReducer    (within a single component)
4. Global client      → Zustand                  (only when nothing else fits)
```

```ts
// ✅ URL state as the first choice for shareable UI state
import { useQueryState } from 'nuqs'

function ProductFilters() {
  const [category, setCategory] = useQueryState('category')
  const [sort, setSort] = useQueryState('sort', { defaultValue: 'newest' })
  // URL: /products?category=shoes&sort=newest
}
```

---

## 🚦 Error Handling & Resilience

```tsx
// app/dashboard/error.tsx — must be a Client Component
'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

```ts
// ✅ Typed result instead of throwing for expected errors
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

export async function updateUser(id: string, data: unknown): Promise<ActionResult<User>> {
  const parsed = UserUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'validation_failed', details: parsed.error.flatten() }
  }
  // ...
  return { success: true, data: updatedUser }
}
```

```ts
// ✅ notFound() for 404 scenarios
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }: { params: { productSlug: string } }) {
  const product = await getProduct(params.productSlug)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
```

**Checklist for every route segment:**
- [ ] `error.tsx` for unexpected exceptions
- [ ] `loading.tsx` for async boundaries
- [ ] `not-found.tsx` for 404 scenarios
- [ ] `global-error.tsx` in root `/app` as catch-all

---

## 🧪 Testability

```ts
// ✅ Dependency injection — makes unit testing straightforward
// utils/email.ts
export async function sendWelcomeEmail(
  to: string,
  emailClient = defaultEmailClient, // injectable
) {
  return emailClient.send({ to, subject: 'Welcome!' })
}

// In a test:
const mockClient = { send: vi.fn() }
await sendWelcomeEmail('test@example.com', mockClient)
```

```tsx
// ✅ Test behavior, not implementation details
import { render, screen, fireEvent } from '@testing-library/react'

test('user can add a product to the cart', async () => {
  render(<AddToCartButton productId="123" />)
  fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
  expect(await screen.findByText(/added/i)).toBeInTheDocument()
})
```

**Test file structure:**
- Colocated pattern: `Button.test.tsx` next to `Button.tsx`
- Or `__tests__/` folder inside the feature folder
- Never place tests inside the `/app` routing tier

---

## 📦 Dependency Hygiene

```bash
# Check for unused packages
npx depcheck

# Audit for security vulnerabilities (required in CI)
pnpm audit

# Check bundle cost before adding a new library
# → https://bundlephobia.com
```

**Rules:**
- Every new library must have a clear justification
- Prefer `pnpm` over `npm` — deterministic lockfile
- Prefer libraries with tree-shaking support (`lodash-es` > `lodash`)
- Regularly update dependencies — `pnpm update --interactive`

---

## 🔁 CI/CD & Git Discipline

### Semantic Commit messages

```
feat: add product filtering by category
fix: resolve race condition in useCartItems hook
chore: update dependencies
refactor: extract pagination logic into custom hook
perf: lazy-load ChartDashboard component
docs: update CLAUDE.md with new conventions
test: add tests for addToCart action
```

### Git Hooks (Husky + lint-staged)

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### Required CI Pipeline steps

```yaml
# .github/workflows/ci.yml
- name: Type check
  run: pnpm tsc --noEmit

- name: Lint
  run: pnpm lint

- name: Test
  run: pnpm test --coverage

- name: Build
  run: pnpm build

- name: Audit
  run: pnpm audit --audit-level=high
```

**Merges are blocked until all steps pass.**

---

## 🔍 Linting & Code Enforcement

```js
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc'
import checkFile from 'eslint-plugin-check-file'

export default [
  ...nextConfig,
  {
    plugins: { 'check-file': checkFile },
    rules: {
      // Routing folders must be kebab-case
      'check-file/folder-naming-convention': [
        'error',
        { 'src/app/**/': 'KEBAB_CASE' },
      ],
      // Components must be PascalCase
      'check-file/filename-naming-convention': [
        'error',
        { 'src/components/**/*.{tsx,ts}': 'PASCAL_CASE' },
      ],
      // Forbid any
      '@typescript-eslint/no-explicit-any': 'error',
      // Require return types
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
]
```

---

## ⚠️ Quick Reference — Common Mistakes

| ❌ Anti-pattern | ✅ Correct |
|---|---|
| `"use client"` on every component | RSC by default, client only for interactivity |
| Fetch in root layout → prop drilling | Fetch directly in the leaf component that needs the data |
| Omitting `import 'server-only'` | Required in all DB/auth/server utility files |
| Reading `process.env.VAR` directly in components | `import { env } from '@/lib/env'` |
| Native `<img>` and `<a>` tags | `next/image` and `next/link` |
| `throw` in Server Actions for user errors | Typed result object `{ success: false, error: '...' }` |
| `any` TypeScript type | `unknown` + type guard or Zod parsing |
| Global state for URL-shareable state | `useQueryState` from `nuqs` |
| Importing entire libraries | Destructure only what you need |
| `<Link><Button>` nesting | Styled `<Link>` for nav, `<Button type="submit">` for forms |
| Enabling a "Soon" nav item with a dead `href="#"` | Render as `<div>` (no href) with `cursor-not-allowed` |
| Mixing accent colors across feature tiers | Violet = core, Teal = analysis, Amber = premium — keep consistent |

---

*Last updated: June 2026 — Next.js 16 / React 19 — reflects auth, landing page, and dashboard v1*
