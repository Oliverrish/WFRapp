@AGENTS.md

# WFRapp - Workshops for Retirement Advisor Portal

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Neon PostgreSQL (MVP)
- Custom OTP email auth with session cookies
- Vercel hosting (MVP, migrate to DigitalOcean later)

## Architecture
- Modular monolith: /features for business logic, /app for routing
- 3 roles: advisor, admin (scoped), super_admin
- Route groups: /(advisor) for advisor pages, /admin/* for admin, /super-admin/* for super admin
- All layouts share the same Sidebar component (role-aware)

## Key Patterns
- DB access via `import { db } from "@/lib/db"` (lazy Neon connection)
- Auth via `import { getCurrentUser } from "@/lib/auth"` in server components
- Client auth via `useAuth()` hook from `@/lib/auth/context`
- API routes in /app/api/
- shadcn/ui components in /components/ui/
- Shared components in /components/shared/

## Design System
- Primary: Navy #1e3a5f
- Accent: Gold #d4a441
- Text: #1a1a2e
- Text light: #64748b
- Background: #faf9f7
- Min body text: 16px, preferred 18px
- Font: Inter (sans-serif)
