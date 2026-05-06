# LuxeSalon — Production-Ready Salon Website

A complete, full-stack salon website built with **Next.js 16**, **Tailwind CSS**, and **SQLite**.

## Features

- **Public site**: Home, Services, About, Gallery, Contact
- **Booking flow**: Multi-step appointment booking (service → date/time → details → confirmation)
- **WhatsApp integration**: Pre-filled booking confirmation message
- **Admin dashboard**: View & manage appointments, block time slots, analytics
- **Auth**: JWT-based admin login (httpOnly cookie)
- **Database**: SQLite via better-sqlite3 (zero-config, file-based)
- **SEO**: Meta tags on every page
- **Analytics**: Page view tracking built-in

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Access the Admin Dashboard

Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Default credentials:**
- Username: `admin`
- Password: `admin123`

> **Important:** Change the JWT_SECRET and admin password before deploying to production.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home
│   ├── services/page.tsx         # Services & Pricing
│   ├── about/page.tsx            # About + Team
│   ├── gallery/page.tsx          # Gallery grid
│   ├── contact/page.tsx          # Contact + map + form
│   ├── booking/page.tsx          # Multi-step booking
│   ├── admin/
│   │   ├── login/page.tsx        # Admin login
│   │   ├── appointments/page.tsx # View & manage appointments
│   │   ├── slots/page.tsx        # Block/unblock time slots
│   │   └── analytics/page.tsx    # Page view + booking stats
│   └── api/
│       ├── appointments/         # GET all, POST create, PATCH status
│       ├── slots/                # GET available, POST block/toggle
│       ├── auth/                 # login, logout, me
│       ├── contact/              # Contact form
│       └── analytics/            # Page tracking
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── sections/                 # Hero, Services, Testimonials, etc.
│   ├── ui/                       # Button, Input, Select, Badge
│   └── admin/                    # AdminNav
├── lib/
│   ├── db.ts                     # SQLite connection + schema init
│   ├── auth.ts                   # JWT helpers
│   ├── services-data.ts          # Static service catalog
│   └── utils.ts                  # Formatting helpers
├── types/index.ts                # TypeScript types
└── proxy.ts                      # Route protection (Next.js 16 proxy)

data/
└── salon.db                      # SQLite database (auto-created on first run)
```

---

## Customization

### Change salon info
- **Name, phone, address**: `src/components/layout/Footer.tsx`, `src/app/contact/page.tsx`
- **WhatsApp number**: Search for `WHATSAPP_NUMBER` constant (Footer, Hero, Contact, Booking)
- **Services & pricing**: `src/lib/services-data.ts`
- **Team members**: `src/app/about/page.tsx`
- **Testimonials**: `src/components/sections/Testimonials.tsx`

### Change admin password
Run in a Node.js REPL to generate a new hash:
```js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-new-password', 10));
```
Then update the hash in the SQLite database (`data/salon.db`):
```sql
UPDATE admin_users SET password_hash = '<new-hash>' WHERE username = 'admin';
```

### Add real images
Place images in `public/images/` and reference them in gallery/about pages.

---

## Production Deployment

```bash
npm run build
npm start
```

**Before going live:**
1. Set a strong `JWT_SECRET` in `.env.local`
2. Change the admin password
3. Update salon contact info and WhatsApp number
4. Update Google Maps embed in `src/app/contact/page.tsx`
5. Add a real email service to `src/app/api/contact/route.ts`
6. Replace gradient placeholders in Gallery with real photos

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Icons | lucide-react |
| Language | TypeScript |
