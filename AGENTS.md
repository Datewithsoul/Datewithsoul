## LINE Official Account

### Customer Side

- LINE Login / LIFF integration
- Send booking confirmation notifications
- Send payment status notifications
- Send payment verification results
- Send booking reminders

### Store / Admin Side

- LINE Official Account integration
- Notify staff when a new booking is created
- Notify staff when a payment slip is uploaded
- Notify staff when a booking is cancelled or expires

# DESIGN.md

# Design Specification

## 1. Design Direction

The website should have a warm, friendly, and trustworthy visual style that reflects the brand and creates a welcoming atmosphere for customers.

The design should prioritize:

- Simple and intuitive navigation
- Clear class and schedule information
- Easy booking flow
- Clear payment instructions
- Mobile-first responsive design
- Strong visual hierarchy
- Easy-to-understand booking status
- Consistent design across the customer website and admin dashboard

---

## 2. Brand Colors

The primary brand colors are:

- Yellow
- Red
- Brown
- White

### Color Roles

#### Primary — Yellow

Used for:

- Primary actions
- Highlights
- Important information
- Selected states
- Brand accents

#### Secondary — Red

Used for:

- Important actions
- Alerts
- Warnings
- Limited availability
- Important status indicators

#### Neutral — Brown

Used for:

- Headings
- Body text
- Borders
- Icons
- Secondary UI elements

#### Background — White

Used for:

- Main page backgrounds
- Cards
- Forms
- Content sections

The colors should be used consistently throughout the website and should maintain sufficient contrast for readability.

---

## 3. Customer Website

### 3.1 Home Page

The home page should provide a clear introduction to the classes and guide users toward booking.

Main sections:

- Header / Navigation
- Hero section
- Featured classes
- Monthly class schedule
- How to book
- Contact / LINE Official Account
- Footer

Primary CTA:

> Book a Class

---

### 3.2 Class Listing

Display available classes by month.

Each class card should include:

- Class name
- Class date
- Available time slots
- Price
- Available seats
- Booking status
- Booking button

Example:

```text
┌─────────────────────────────┐
│ Class Name                  │
│                             │
│ 20 August 2026              │
│                             │
│ 10:00 - 12:00               │
│ 8 seats available            │
│                             │
│ 14:00 - 16:00               │
│ 3 seats available            │
│                             │
│ ฿1,500                      │
│                             │
│ [ Book Now ]                │
└─────────────────────────────┘