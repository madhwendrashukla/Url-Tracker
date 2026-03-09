# QR Code & Link Management System

A comprehensive, production-ready system for creating, managing, and tracking QR codes and short links. Built with modern web technologies.

## Features
- **Dashboard Overview**: Get a bird's-eye view of your links and QR codes performance, total scans, and recent activities.
- **QR Code Generator**: Create custom QR codes with customizable colors, save them, and download them as SVG.
- **Short Links**: Shorten long URLs with optional custom slugs and UTM tracking parameters.
- **Detailed Analytics**: Track user devices, operating systems, browsers, IP addresses, and see click trends over time using interactive Recharts.
- **Secure Authentication**: Built-in user authentication powered by NextAuth.js and bcrypt encryption.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** Prisma with SQLite
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **QR Generation:** qrcode.react
- **Data Visualization:** Recharts

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the database:
   ```bash
   npx prisma db push
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Security
- Passwords are securely hashed with `bcryptjs`.
- All requests are structured via Next.js Server Actions with built-in CSRF protection.
- Database access is strictly handled via Prisma on the server.
