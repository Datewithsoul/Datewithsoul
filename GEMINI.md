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

---

## 4. UI Component Library

Recommend using **shadcn/ui** (ui.shadcn.com) as the base UI component library:

- Beautiful, accessible components (built on Radix UI), fully customizable via Tailwind
- Full control over design tokens (color, radius, spacing) — easy to align with the brand's Yellow/Red/Brown/White palette
- Components likely to be used heavily: `Card` (class card), `Badge` (booking status / seats available), `Button`, `Dialog` (booking confirmation), `Tabs` (month selector), `Calendar`, `Form`, `Toast` (notification feedback)
- Copy-paste directly into the project rather than a heavy dependency — fits a dev workflow with lots of customization

---

## 5. Visual Style — Pop Art Direction

In addition to "warm, friendly, trustworthy," bring in a fun, vibrant **pop art** feel through these details:

- **Bold outlines** around cards and key buttons instead of soft shadows — gives a graphic/comic-book feel
- **High-contrast color blocking** — use Yellow and Red as solid blocks in attention-grabbing spots (e.g. "Few seats left" badges, the Book Now button) instead of gradients
- **Halftone / dot pattern** as a light background or decorative element — a pop-art classic
- **Bold, chunky, punchy typography** for headings/prices — should feel "bouncy" and fun, not elegant/minimal
- **Playful micro-interactions** — button bounce, slight card tilt on hover, confetti/burst effect on successful booking
- Use Brown as the primary outline/border color instead of plain gray/black, so the pop-art style stays warm rather than feeling cold

This direction fits the Class Listing cards and Booking Status page best, since those are where you want fun + clarity at the same time. The admin dashboard should tone it down (same colors, but more minimal) for easier day-to-day readability.