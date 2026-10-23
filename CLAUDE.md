# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

AGENTS.md (imported above) holds the LINE OA requirements, the design spec (brand colors, pop-art direction, shadcn/ui), and the Next.js agent rules. Next.js here is 16.x: read `node_modules/next/dist/docs/` before relying on remembered APIs.

## Commands

```bash
npm run dev              # next dev
npm run build            # prisma generate && next build
npm run lint             # eslint (flat config, eslint.config.mjs)
npx tsc --noEmit         # type check (build does NOT catch type errors, see below)
npx prisma generate      # regenerate client into app/generated/prisma (also runs on postinstall)
npx prisma db push       # sync schema to DB (prisma/migrations is empty; there is no migration history)
npx tsx scripts/<name>.ts  # one-off maintenance scripts (orphan user cleanup, trigger tests); tsx is not a dependency, npx fetches it
```

There is no test suite. CI (`.github/workflows/ci.yml`) runs `npm ci`, `prisma generate`, lint (non-blocking, `|| true`), and `npm run build`.

`next.config.ts` sets `typescript.ignoreBuildErrors: true`, so a passing build means nothing about types. Run `npx tsc --noEmit` after changes.

## Stack

- Next.js 16 App Router, React 19, Tailwind v4 (CSS-first config in `app/globals.css`, brand tokens like `--brand-yellow` / `--brand-red` / `--brand-brown` mapped to `bg-brand-*` utilities).
- shadcn/ui with style `base-nova`: components in `components/ui/` are built on **Base UI (`@base-ui/react`), not Radix**. Follow Base UI APIs (e.g. `render` prop rather than `asChild`).
- Prisma 7 + PostgreSQL (Supabase) through the `pg` driver adapter (`lib/prisma.ts`). Client output is `app/generated/prisma` (gitignored); import enums/types from `@/app/generated/prisma`. `prisma.config.ts` loads `.env.local` then `.env` and prefers `DIRECT_URL` over `DATABASE_URL` for CLI commands.
- Supabase is used for **auth and storage only**; all app data goes through Prisma.
- Deploys to Vercel (crons in `vercel.json`); `Dockerfile` uses `output: 'standalone'` when not on Vercel.
- UI copy is Thai.

## Architecture

### Auth and users
- Customers log in with LINE. `app/api/auth/line/callback/route.ts` exchanges the LINE code, then creates/updates a Supabase auth user with a synthetic email (`<lineId>@line.datewithsoul.local`) and a one-time password, and keeps the Prisma `User` row in sync. The Prisma `User.id` equals the Supabase auth user id, and `User.lineId` is the LINE user id used for push messages.
- No middleware/proxy file. Auth is checked per page/action: `createClient()` from `utils/supabase/server.ts`, then a Prisma lookup for role. Admin pages live under `app/admin/(protected)/`, whose `layout.tsx` gates on `role === "ADMIN"`; server actions should call `requireAdmin()` from `lib/require-admin.ts` themselves (a layout doesn't protect actions).
- `utils/supabase/admin.ts` is the service-role client (server only).

### Booking domain (`prisma/schema.prisma`)
- `ClassEvent` is one scheduled round. Classes with multiple rounds are separate `ClassEvent` rows sharing a `name` (see `classes/group-edit/[name]`). **`totalSeats` is the remaining seat count**: it is decremented when a booking is made and incremented when one is cancelled/expired.
- Checkout is cart-based (`hooks/use-cart.tsx` client state → `app/cart/actions.ts#createCartBookings`). A cart creates a `BookingGroup` with several `Booking`s and one `Payment`; single bookings attach a `Payment` directly. Payment pages exist for both: `app/payment/[bookingId]` and `app/payment/group/[groupId]`.
- Payment is PromptPay QR + uploaded slip, reviewed manually by an admin (`PaymentReviewLog`). Slips go to the private Supabase bucket `payment-slips` (`lib/slips.ts`) and are served via signed URLs through `app/api/slips/[paymentId]`. Class media goes to Supabase storage, videos to Bunny (`utils/bunny.ts`).
- Status enums and Thai labels live in `lib/booking-status.ts`; reuse them instead of hardcoding strings.
- Unpaid bookings expire after `PAYMENT_WINDOW_MS` (10 min) in `lib/expire-bookings.ts`. It is written to be concurrency-safe (conditional `updateMany` inside a transaction, so seats are released once); keep that pattern for any status transition that moves seats.
- Customers can request round changes/cancellations (`ChangeRequest`), which admins approve under `admin/(protected)/requests`.
- Promo codes: `lib/promo.ts` (pure discount math) and `app/cart/actions.ts#validatePromoCode` / `app/api/validate-promo`.

### LINE notifications
- `lib/line.ts`: `sendTemplatedLineMessage` (to a customer's `lineId`) and `notifyAdminsTemplated` (to all ADMIN users with a `lineId`). Each send is recorded in `NotificationLog`. Token comes from `LINE_CHANNEL_ACCESS_TOKEN`, or is fetched with `LINE_OA_CLIENT_ID`/`SECRET`.
- Message text is template-driven: defaults and variables are defined in `TEMPLATE_DEFINITIONS` (`lib/message-templates-types.ts`), admins can override them (`MessageTemplate` table, edited at `admin/notifications/templates`). To add a notification, add a definition there and call it by key. `ensureMessageTemplateTable()` creates the table with raw SQL if it is missing.
- Notification failures are caught and logged so they never roll back a booking or payment change.

### Cron routes
`app/api/cron/{expire-bookings,reminders,cleanup-slips}` require `Authorization: Bearer $CRON_SECRET`.

## Environment

`.env` / `.env.local` (gitignored). Variables in use: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` (also used to build the LINE login redirect URI), `LINE_CLIENT_ID`, `LINE_CLIENT_SECRET` (LINE Login), `LINE_CHANNEL_ACCESS_TOKEN` or `LINE_OA_CLIENT_ID` + `LINE_OA_CLIENT_SECRET` (Messaging API), `CRON_SECRET`, `BUNNY_API_KEY`, `BUNNY_LIBRARY_ID`.
