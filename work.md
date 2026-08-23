# Admin Dashboard Improvement Summary

## Goal

Improve the admin dashboard so staff can manage bookings, payments, classes, customers, and LINE notifications quickly and clearly.

## Priority 1: Core Operations

### Dashboard Overview

- New bookings today
- Payments waiting for verification
- Classes that are almost full
- Monthly revenue
- Bookings that are about to expire

### Urgent Tasks Queue

Show actionable items that require staff attention:

- New bookings
- Payment slips waiting for review
- Cancelled bookings
- Expiring bookings
- Quick actions such as `Review Payment` and `Confirm Booking`

### Booking Management

- Search by customer name, phone number, or booking ID
- Filter by booking, payment, and attendance status
- View customer, class, time slot, and payment details
- Change booking status with a reason
- Cancel bookings, process refunds, and handle expired bookings
- Support bulk actions for common staff workflows

### Payment Slip Verification

- Preview the uploaded payment slip
- Display expected amount, paid amount, and payment time
- Approve or reject the payment
- Add internal notes
- Record who reviewed the slip and when

## Priority 2: Class and Schedule Management

### Calendar and Class Management

- Monthly and weekly calendar views
- Create, edit, and remove classes
- Configure class date, time slots, price, and seat capacity
- Adjust available seats
- Close or reopen a time slot
- Clearly show remaining seats and booking status

## Priority 3: LINE Official Account Operations

### LINE Notification Center

- Show LINE Official Account connection status
- Keep a delivery history for notifications
- Notify staff when a booking is created
- Notify staff when a payment slip is uploaded
- Notify staff when a booking is cancelled or expires
- Support retrying failed notifications
- Show clear error messages when delivery fails

## Priority 4: Administration and Reliability

### Roles and Permissions

- Separate Admin and Staff permissions
- Restrict sensitive actions such as refunds, payment approval, and configuration changes

### Audit Log

- Record who changed a booking or payment status
- Record what changed and when
- Keep a reason or note for important actions

### Essential UI States

- Loading states
- Empty states
- Error states with recovery actions
- Confirmation dialogs for destructive or sensitive actions
- Responsive layout for mobile staff usage
- Pagination and sorting by urgency or date

## Recommended Workflow Focus

The dashboard should prioritize the following workflow:

1. Review a new booking
2. Verify the payment slip
3. Confirm the booking
4. Notify the customer through LINE
5. Monitor upcoming classes and remaining seats

## Design Direction

- Keep the warm Yellow, Red, Brown, and White brand palette
- Use a more minimal and practical visual style than the customer website
- Preserve strong status colors and clear visual hierarchy
- Use Brown for borders and outlines instead of neutral gray where appropriate
- Make urgent actions visually prominent without making the dashboard feel noisy

## Suggested Implementation Order

1. Booking management and status workflow
2. Payment slip verification
3. Urgent tasks queue and dashboard metrics
4. Class and schedule management
5. LINE notification center
6. Roles, permissions, and audit logs
7. Responsive, loading, empty, and error states
