# System Audit and Remaining Work

## Current Status

The project already contains a solid MVP foundation:

- LINE Login with Supabase authentication
- Class browsing and class detail pages
- Single-class and multi-class group bookings
- Payment slip upload
- Admin payment verification
- Admin class, booking, and user management
- LINE notifications for several booking and payment events
- Vercel cron configuration for class reminders
- Supabase Storage integration

The production build currently passes with `npm run build`.
However, `npm run lint` is not passing and reports a large number of errors and warnings.

## High-Priority Missing or Incomplete Systems

### 1. Booking Ownership Authorization

Payment upload and booking cancellation actions verify that the user is logged in, but do not consistently verify that the booking or booking group belongs to the authenticated user.

Potential impact:

- A user who knows another booking ID may access or modify that booking.
- A user may upload a payment slip for another user's booking.
- A user may cancel another user's booking.

Relevant files:

- `app/payment/[bookingId]/actions.ts`
- `app/payment/group/[groupId]/actions.ts`

Required work:

- Check `booking.userId === authenticatedUser.id` before every booking action.
- Check `bookingGroup.userId === authenticatedUser.id` before every group action.
- Return an authorization error instead of continuing when ownership fails.

### 2. Safe Seat Reservation Under Concurrent Bookings

The application checks available seats and decrements the seat count in separate operations. Multiple users booking at the same time may oversell a class or make the seat count negative.

Relevant files:

- `app/book/[classId]/actions.ts`
- `app/cart/actions.ts`

Required work:

- Perform seat validation and decrement inside one transaction.
- Update seats only when `totalSeats >= requestedSeats`.
- Fail the transaction when there are not enough seats.
- Add tests for simultaneous bookings.

### 3. Automatic Booking Expiration

Booking expiration currently happens mainly when a customer opens the payment page. There is no reliable background job that finds all expired unpaid bookings and releases their seats.

Required work:

- Add an expiration job for unpaid single bookings and booking groups.
- Restore seats exactly once when a booking expires.
- Mark the booking, group, and payment statuses consistently.
- Notify both the customer and staff when expiration occurs.

### 4. Secure Cron Endpoint

The cron endpoint checks `CRON_SECRET`, but the unauthorized response is commented out. This means the endpoint may still execute when called without valid authorization.

Relevant file:

- `app/api/cron/reminders/route.ts`

Required work:

- Return HTTP 401 for missing or invalid authorization.
- Keep `CRON_SECRET` configured in the deployment environment.
- Add logging for cron start, completion, failure, and processed record counts.

### 5. Duplicate Reminder Prevention

The reminder job does not store whether a reminder has already been sent. If the cron job runs more than once, customers may receive duplicate messages.

Required work:

- Add reminder tracking fields or a notification log table.
- Make reminder sending idempotent.
- Track one-day-before and same-day reminders separately.

### 6. Complete LINE Staff Notifications

LINE notifications exist, but coverage is incomplete.

Missing or incomplete notification events include:

- Booking expiration from the background job
- Group booking expiration
- Payment rejection with a reason
- Class changes made by an administrator
- Class cancellation by the store
- Booking updates made by an administrator

Required work:

- Centralize notification templates.
- Store delivery results and failures.
- Add retry handling for temporary LINE API failures.

### 7. Payment Audit Trail

The database stores only the current payment status. It does not record who reviewed a payment, when it was reviewed, or why it was rejected.

Required work:

- Add a payment review history table.
- Store reviewer ID, previous status, new status, reason, and timestamp.
- Show the review history in the admin interface.

### 8. Secure Payment Slip Uploads

Payment slip uploads need stronger validation and access control.

Required work:

- Validate file type and file size on the server.
- Restrict uploads to supported image formats.
- Prevent repeated or excessive uploads.
- Consider private storage and signed URLs for payment slips.
- Delete or archive replaced slips according to a retention policy.

### 9. Complete Booking Validation

Booking actions need server-side validation for all important business rules.

Required validation:

- Seat count must be a positive integer.
- Requested seats must not exceed available seats.
- The class must still be open for booking.
- The class must not have already started.
- Client-provided prices must never be trusted.
- Duplicate bookings should be handled intentionally.
- Cancelled or completed classes must reject new bookings.

### 10. LINE Authentication Security Improvements

The LINE callback currently uses the LINE user ID as an internal password and calls `listUsers()` to find an existing Supabase user.

Required work:

- Avoid using a predictable LINE user ID as a password.
- Link LINE identity to the existing authenticated account securely.
- Avoid loading all Supabase users during every login.
- Validate environment variables before starting the authentication flow.
- Avoid exposing raw authentication error messages in redirect URLs.

## Medium-Priority Missing Systems

### 11. Class Lifecycle Status

`ClassEvent` currently has no explicit lifecycle status.

Consider adding:

- `DRAFT`
- `PUBLISHED`
- `FULL`
- `CANCELLED`
- `COMPLETED`

This will make publishing, hiding, cancelling, and completing classes more reliable.

### 12. Refund and Class Change Rules

The admin interface supports changing a booking's class, but the business rules should be completed.

Required work:

- Validate capacity of the new class atomically.
- Record the class change history.
- Notify the customer through LINE.
- Define refund, price difference, and cancellation policies.

### 13. Automated Tests

There is no complete automated test suite for the critical business flows.

Tests should cover:

- Booking ownership checks
- Concurrent seat reservations
- Booking expiration
- Booking cancellation
- Payment upload and review
- Payment rejection
- Group booking flows
- LINE notification failures
- Admin authorization

### 14. Observability and Error Handling

The application mainly logs errors to the console and does not provide an operational view.

Consider adding:

- Structured server logs
- Error tracking
- Notification failure records
- Admin-visible failed jobs
- Basic metrics for bookings, payments, cancellations, and reminders

### 15. Data Retention and Privacy Controls

The project should define how long user data, payment slips, and notification logs are retained.

Required work:

- Add privacy policy and terms of service pages.
- Define payment slip retention and deletion rules.
- Provide an account/data deletion process where required.
- Review public media and payment storage permissions.

## Code Quality and Deployment Work

### Lint

`npm run lint` currently fails with many errors and warnings, including:

- Generated Prisma files being linted
- Many `any` types
- Unused imports and variables
- React effect rule violations
- Use of `<img>` instead of optimized images
- Parsing errors in test files

Required work:

- Exclude generated Prisma output from linting.
- Fix application-level lint errors.
- Remove or repair broken test scripts.
- Replace unsafe `any` types where practical.
- Replace image tags with `next/image` where appropriate.

### Configuration

The build reports that the `eslint` option in `next.config.ts` is no longer supported by the current Next.js version.

Required work:

- Remove the obsolete Next.js ESLint configuration.
- Run lint separately in CI and before deployment.
- Add environment variable validation for production.

## Recommended Implementation Order

1. Fix booking and payment ownership authorization.
2. Make seat reservation atomic and concurrency-safe.
3. Secure the cron endpoint.
4. Implement automatic expiration and seat restoration.
5. Add payment audit history and rejection reasons.
6. Harden payment slip validation and storage permissions.
7. Complete LINE notification coverage and delivery logging.
8. Improve LINE authentication security.
9. Add class lifecycle and refund/change policies.
10. Add automated tests and observability.
11. Clean up lint, configuration, and deployment checks.

## Final Assessment

The project is a functional MVP, but it is not yet production-ready for real customer traffic. The most important risks are unauthorized booking actions, overselling seats during concurrent bookings, incomplete automatic expiration, unsecured cron execution, and missing payment audit history.
