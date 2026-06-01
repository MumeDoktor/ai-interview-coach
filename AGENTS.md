<!-- BEGIN:nextjs-agent-rules -->
# Critical: This is Next.js 16 — breaking changes from training data

Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Do not rely on Next.js 13–15 knowledge.

## Confirmed breaking changes in this project

### `proxy.ts` replaces `middleware.ts`
The middleware file is now called `proxy.ts`. The default export function must also be named `proxy`, not `middleware`. The `config.matcher` export works the same way.

```ts
// ✅ proxy.ts
export default async function proxy(req: NextRequest) { ... }
export const config = { matcher: [...] }

// ❌ middleware.ts — does not exist in Next.js 16
```

### Prisma 6: import path changed
Prisma 6 generates the client to `lib/generated/prisma/` (configured in `prisma.config.ts`). The entry point is `client.ts`, not an index — so the import path is:

```ts
// ✅
import { PrismaClient } from '@/lib/generated/prisma/client'

// ❌ — @prisma/client is not used in Prisma 6
import { PrismaClient } from '@prisma/client'
```

### Prisma 6: config lives in `prisma.config.ts`
Schema and datasource config moved from `schema.prisma` to `prisma.config.ts` at the project root. The `.env` file is loaded via `import "dotenv/config"` inside that file.

### Auth.js v5: split config required for Edge/proxy compatibility
`proxy.ts` runs in the Edge runtime. Importing `lib/auth.ts` into it pulls in `lib/db.ts` (Prisma — Node.js only) and crashes. Always split the auth config:

```
lib/auth.config.ts   — Edge-safe: session strategy, pages, callbacks. No providers, no Prisma.
lib/auth.ts          — Full config: spreads authConfig + adds Credentials provider with Prisma.
proxy.ts             — Imports only from auth.config.ts via NextAuth(authConfig).
```

```ts
// proxy.ts ✅
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
const { auth } = NextAuth(authConfig)
export default auth
```

### Zod v4: schema API changes
`.email()`, `.min()` etc. now accept `{ message: '...' }` — the `error` key was renamed to `message`.

```ts
// ✅ Zod v4
z.string().email({ message: 'Invalid email.' })

// ❌ Zod v3 style
z.string().email({ error: 'Invalid email.' })
```
<!-- END:nextjs-agent-rules -->