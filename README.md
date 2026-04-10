# WFR App

WFR App is a Next.js 16 operations portal for workshop scheduling, advisor workflows, approvals, leads, and live event check-ins. The app uses the App Router, Drizzle ORM, Neon Postgres, SMTP-delivered OTP authentication, and an Overporten access layer.

## Requirements

- Node.js 20+
- npm 11+
- PostgreSQL or Neon reachable through `DATABASE_URL`
- SMTP credentials for OTP delivery outside local development
- Overporten bridge configuration for non-local access

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the database, SMTP, and Overporten values.
3. Install dependencies with `npm install`.
4. Apply the schema with `npm run db:push`.
5. Optionally seed local data with `npx tsx src/lib/db/seed.ts`.
6. Start the app with `npm run dev`.

## Environment Variables

- `DATABASE_URL`: Database connection string used by the runtime and Drizzle tooling.
- `SESSION_EXPIRY_DAYS`: Session lifetime in days. Defaults to `7`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: OTP email delivery configuration.
- `ALLOW_DEMO_AUTH`: Local-only escape hatch for seeded demo users. Keep this `false` in deployed environments.
- `OVERPORTEN_SHARED_SECRET`: Secret used to validate Overporten bridge tokens.
- `OVERPORTEN_PROJECT_SLUG`: Project slug used when redirecting through Overporten.
- `OVERPORTEN_PUBLIC_HUB_URL`: Optional hub base URL. Defaults to `https://www.overporten.com`.

## Scripts

- `npm run dev`: Start the Next.js dev server.
- `npm run build`: Build the production bundle.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint.
- `npm run typecheck`: Run TypeScript without emitting output.
- `npm run test`: Run the unit test suite.
- `npm run db:generate`: Generate Drizzle migrations from schema changes.
- `npm run db:push`: Push the current schema to the database.
- `npm run db:studio`: Open Drizzle Studio.

## Auth Model

- Accounts must already exist in `profiles`; OTP login no longer creates new users automatically.
- OTP delivery fails closed when SMTP is unavailable in deployed environments.
- Advisor routes are guarded at the server layout boundary before the client shell renders.

## Deployment Notes

- The app builds with `output: "standalone"` for straightforward container or VM deployment.
- `src/proxy.ts` enforces Overporten project access before the app session layer, so missing bridge configuration will surface as `503` responses outside localhost.
- Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before releasing.

