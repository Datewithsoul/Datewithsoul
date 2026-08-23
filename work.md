# Admin Dashboard Work Summary

## 1. Product Goal

Build a practical and trustworthy admin dashboard for managing bookings, payments, classes, customers, and LINE Official Account notifications.

The dashboard should help staff answer one question immediately:

> What needs attention right now?

The primary workflow is:

1. Review a new booking
2. Verify the payment slip
3. Confirm the booking
4. Notify the customer through LINE
5. Monitor upcoming classes and remaining seats

## 2. Design Direction

The admin dashboard should use the same brand foundation as the customer website while being more minimal and operational.

### Brand Colors

- Yellow: primary actions, highlights, selected states, and important information
- Red: warnings, urgent actions, rejected payments, cancellations, and limited availability
- Brown: headings, body text, borders, icons, and primary outlines
- White: page backgrounds, cards, forms, and content areas

### Visual Style

- Warm, friendly, and trustworthy
- Clear visual hierarchy
- Strong Brown outlines instead of cold gray borders
- Limited shadows and no excessive gradients
- Bold but readable typography
- Use Yellow and Red as solid color blocks for emphasis
- Keep the Pop Art character subtle enough for daily staff use
- Make urgent information prominent without making the interface noisy

## 3. Main Navigation

Use a persistent desktop sidebar and a drawer-based navigation on mobile.

Recommended navigation items:

- Dashboard
- Bookings
- Payment Verification
- Classes & Schedule
- Customers
- LINE Notifications
- Reports
- Settings

The active navigation item should be clearly highlighted with the Yellow brand color.

## 4. Dashboard Overview

### KPI Cards

Display the most important operational metrics:

- New bookings today
- Payments waiting for verification
- Classes that are almost full
- Monthly revenue
- Bookings that are about to expire

KPI cards should show a clear number, label, time range, and optional trend indicator. Use color carefully so only urgent metrics feel alarming.

### Urgent Tasks Queue

Show actionable items that require staff attention:

- New bookings
- Payment slips waiting for review
- Cancelled bookings
- Expiring bookings
- Failed LINE notifications

Each item should have a clear status, timestamp, customer or booking reference, and a quick action such as `Review Payment` or `Confirm Booking`.

## 5. Booking Management

### Booking List

- Search by customer name, phone number, or booking ID
- Filter by booking, payment, and attendance status
- Filter by class date and time slot
- Sort by urgency, date, or latest update
- Use pagination for large datasets
- Support bulk actions for common workflows
- Keep table headers visible while scrolling

### Booking Table

Recommended columns:

- Booking ID
- Customer
- Class and time slot
- Booking date
- Payment status
- Booking status
- Amount
- Last updated
- Quick actions

On mobile, transform table rows into stacked cards with the most important information first.

### Booking Details Drawer

Open booking details in a Drawer or Sheet without forcing staff to leave the list.

Include:

- Customer information
- Class and time slot
- Payment details
- Uploaded payment slip
- Current booking status
- Internal notes
- Booking timeline
- Available actions

### Booking Timeline

Show the booking history in chronological order:

- Booking created
- Payment slip uploaded
- Payment verified or rejected
- Booking confirmed
- Reminder sent
- Booking completed, cancelled, or expired

## 6. Booking Status System

Use both text and color. Never rely on color alone.

Recommended statuses:

- Pending Payment
- Payment Under Review
- Payment Rejected
- Confirmed
- Cancelled
- Expired
- Completed

Use consistent Badge styles and icons across tables, cards, drawers, notifications, and calendar views.

## 7. Payment Slip Verification

### Review Layout

Use a two-column desktop layout:

- Left: payment slip preview
- Right: booking details, expected amount, paid amount, and payment time

On mobile, stack the slip preview above the booking information.

### Required Actions

- Preview the uploaded payment slip
- Display expected amount, paid amount, and payment time
- Approve the payment
- Reject the payment
- Add internal notes
- Record who reviewed the slip and when
- Require a reason before rejecting a payment
- Show a confirmation dialog before final approval or rejection

The `Approve` action should use Yellow or a positive state color. The `Reject` action should use Red and require clear confirmation.

## 8. Class and Schedule Management

### Calendar UI

- Support monthly and weekly views
- Show the number of seats remaining in each time slot
- Use distinct states for Available, Almost Full, Full, and Cancelled
- Click a date or slot to view and edit class details
- Support filters by class type and availability

### Class Management

- Create, edit, and remove classes
- Configure class date, time slots, price, and seat capacity
- Adjust available seats
- Close or reopen a time slot
- Display booking count and remaining capacity
- Confirm before deleting or closing a class

## 9. LINE Official Account Operations

### LINE Notification Center

- Show LINE Official Account connection status
- Keep a delivery history for notifications
- Notify staff when a booking is created
- Notify staff when a payment slip is uploaded
- Notify staff when a booking is cancelled or expires
- Support retrying failed notifications
- Show clear error messages when delivery fails

### Notification UI

Each notification record should show:

- Notification type
- Recipient
- Related booking
- Delivery status
- Sent time
- Error message, if any
- Retry action, if available

## 10. Recommended shadcn/ui Components

Use shadcn/ui as the foundation for consistent, accessible, and customizable interface primitives. The component source can be customized directly in the project, which is useful for matching the brand design system.

Recommended components:

- `Sidebar` for main navigation
- `Card` for KPI metrics and summary panels
- `Table` and `Data Table` for booking and payment lists
- `Badge` for booking and payment statuses
- `Tabs` for status filters and content sections
- `Dialog` and `Alert Dialog` for confirmations
- `Drawer` or `Sheet` for booking details
- `Calendar` and `Date Picker` for schedules and date filters
- `Command` for fast search and navigation
- `Dropdown Menu` for row actions
- `Toast` for success and failure feedback
- `Alert` for urgent information and system errors
- `Skeleton` for loading states
- `Empty` for no-data states
- `Pagination` for large lists
- `Tooltip` for icon-only actions
- `Form`, `Input`, `Select`, and `Textarea` for data entry

### Components That Need Custom Styling

The following should be customized rather than used with default styling:

- KPI cards
- Status badges
- Payment review panel
- Urgent task queue
- Booking timeline
- Calendar availability indicators
- Mobile action bar
- Empty states and illustrations
- Primary and destructive buttons

Customize the design tokens, color palette, border thickness, radius, typography, spacing, and focus states to match the Yellow, Red, Brown, and White brand system.

## 11. Admin-Specific UI Patterns

### Quick Actions

Place high-frequency actions close to the relevant data:

- Review Payment
- Confirm Booking
- Cancel Booking
- Resend LINE Notification
- View Customer

### Confirmation and Feedback

- Use confirmation dialogs before cancellation, rejection, refund, deletion, or closing a class
- Show loading feedback inside the active button
- Show a Toast after successful actions
- Show recoverable error messages with a retry action
- Provide Undo for reversible changes where appropriate

### Responsive Behavior

- Desktop: persistent sidebar, data tables, two-column review layouts
- Tablet: collapsible sidebar, flexible tables, fewer visible columns
- Mobile: navigation drawer, stacked cards, full-width forms, bottom action bar, and stacked payment review layout

### Accessibility

- Maintain sufficient contrast
- Do not use color as the only status indicator
- Provide visible keyboard focus states
- Support keyboard navigation
- Use clear labels for buttons and form fields
- Ensure touch targets are large enough on mobile
- Preserve readable text sizes and spacing

## 12. Empty, Loading, and Error States

Every major screen should define:

- Loading state with Skeleton components
- Empty state with a useful explanation and next action
- Error state with a clear message and retry action
- Permission-denied state when the user lacks access
- Offline or failed-notification state when external services are unavailable

## 13. Roles, Permissions, and Auditability

### Roles and Permissions

- Separate Admin and Staff permissions
- Restrict refunds, payment approval, configuration changes, and deletion to authorized roles
- Hide or disable unavailable actions with an explanation

### Audit Log

- Record who changed a booking or payment status
- Record what changed and when
- Keep a reason or note for important actions
- Make the history easy to inspect from the booking detail view

## 14. Suggested Implementation Order

1. Booking management and status workflow
2. Payment slip verification UI
3. Urgent tasks queue and dashboard metrics
4. Booking details Drawer and timeline
5. Class and schedule management
6. LINE notification center
7. Roles, permissions, and audit logs
8. Responsive behavior and mobile actions
9. Loading, empty, error, and accessibility states
10. Final brand styling and interaction polish
