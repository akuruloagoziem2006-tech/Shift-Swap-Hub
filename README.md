# ShiftSwap Hub

A modern shift swap management platform for essential workers. Built with Next.js, shadcn/ui, and Supabase.

![ShiftSwap](https://via.placeholder.com/1200x630/1a1a1a/14b8a6?text=ShiftSwap+Hub)

---

## 🚀 Production Ready

**This app is ready for deployment.** Follow the setup steps below.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub.git
cd Shift-Swap-Hub

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Live Demo

> ⚠️ **Note:** Deploy to Vercel and add your deployment URL here.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub)

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Supabase Auth with email/password, social login (Google, GitHub) |
| 📅 **Browse Shifts** | Filter and search available shifts by date, department, position |
| 📝 **Post Shifts** | Offer your shifts for swap with details |
| 🔄 **Request Swaps** | Send swap requests to shift owners |
| ✅ **Manager Approval** | Managers can approve/reject swap requests |
| 📆 **Calendar View** | Visual monthly calendar with all shifts |
| 👤 **User Profiles** | Manage profile, department, and preferences |
| 🌙 **Dark Mode** | Modern dark theme optimized for night shifts |
| 📱 **Responsive** | Works on desktop and mobile devices |

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + Radix UI
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: React Hook Form + Zod

## Project Structure

```
shift-swap-hub/
├── app/
│   ├── api/                 # API routes (shifts, swap-requests, auth)
│   ├── auth/                # Login, signup pages
│   ├── dashboard/           # Protected dashboard pages
│   │   ├── calendar/         # Interactive calendar view
│   │   ├── manager/          # Manager approval workflow
│   │   ├── browse/           # Browse available shifts
│   │   ├── post/             # Post new shift
│   │   ├── my-shift/         # Manage own shifts
│   │   └── profile/         # User profile
│   └── page.tsx             # Landing page
├── components/ui/           # shadcn/ui components
├── lib/
│   ├── supabase/            # Supabase client helpers
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
├── proxy.ts                 # Auth middleware (Next.js 16)
├── SETUP_DATABASE.sql       # Database setup script
├── .env.example             # Environment variables template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- A [Supabase](https://supabase.com/) project

### 1. Clone the Repository

```bash
git clone https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub.git
cd Shift-Swap-Hub
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**
2. Run the database setup script from [`SETUP_DATABASE.sql`](./SETUP_DATABASE.sql)
3. Go to **Authentication** → **Providers** → Enable **Email/Password**

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup ⚠️

**⚠️ Important:** Before using the app, you must create the database tables in Supabase:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard)
2. Copy and paste the SQL from [`SETUP_DATABASE.sql`](./SETUP_DATABASE.sql)
3. Click "Run" to execute

The SQL creates:
- `profiles` - User profiles with roles
- `shifts` - Shift information
- `shift_swap_requests` - Swap request tracking

See [`SETUP_DATABASE.sql`](./SETUP_DATABASE.sql) for the complete SQL script.

## Features Overview

### Dashboard Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard with overview stats |
| `/dashboard/calendar` | Interactive calendar view of all shifts |
| `/dashboard/browse` | Browse and filter available shifts |
| `/dashboard/post` | Post a new shift for swap |
| `/dashboard/my-shift` | View and manage your shifts |
| `/dashboard/profile` | Edit your profile (name, role, department) |
| `/dashboard/manager` | Manager approval workflow (manager/admin only) |

### User Roles

- **Employee**: Browse shifts, request swaps, manage own shifts
- **Manager**: All employee features + approve/reject swap requests
- **Admin**: Full system access including user management

### Authentication

The app uses Supabase Auth with multiple authentication methods:

#### Email/Password
- Sign up with email and password (minimum 8 characters)
- Sign in with credentials
- Password reset via email

#### Social Login (OAuth)
- **Google**: Click "Google" button on auth page
- **GitHub**: Click "GitHub" button on auth page

#### Setup Social Login in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** or **GitHub**
4. Enter your OAuth credentials
5. Add callback URL to your OAuth app settings:
   - Google: `https://your-project.supabase.co/auth/v1/callback`
   - GitHub: `https://your-project.supabase.co/auth/v1/callback`

#### Protected Routes

All `/dashboard/*` routes are protected by middleware. Unauthenticated users are redirected to `/auth`.

## Deployment

### 🚀 Production Deployment Checklist

Before deploying, complete these steps:

- [x] Supabase project created
- [x] Environment variables configured
- [x] Code pushed to GitHub ✅
- [x] Middleware protecting dashboard routes ✅
- [x] Unified auth page with social login ✅
- [ ] **Database tables created** (run `SETUP_DATABASE.sql` in Supabase SQL Editor)
- [ ] Supabase Auth configured (email/password + OAuth providers)
- [ ] Environment variables added to Vercel

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub
   - Select this repository

3. **Add Environment Variables in Vercel:**
   
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://qvizpavpwezozwupvxxt.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from Supabase Settings > API) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase Settings > API) |

4. **Deploy!**

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Manual Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Post-Deployment Setup

1. **Create Database Tables:**
   - Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/qvizpavpwezozwupvxxt/sql/new)
   - Run the SQL from [`SETUP_DATABASE.sql`](./SETUP_DATABASE.sql)

2. **Configure Supabase Auth:**
   - Go to Supabase Dashboard > Authentication
   - Enable Email/Password provider
   - Configure redirect URLs for your domain

3. **Set Up First Manager:**
   ```sql
   UPDATE profiles SET role = 'manager' WHERE email = 'admin@example.com';
   ```

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint ."
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Ideas for Contributors

- 🔔 Add email notifications for swap requests
- 📊 Build an analytics dashboard
- 📱 Create a mobile app (React Native or PWA)
- 🌐 Add multi-language support (i18n)
- 📈 Add shift statistics and trends
- 💬 Implement real-time chat between users

## License

MIT License - see LICENSE file for details.

---

## 🎉 ShiftSwap is Ready for Real Users!

### Live Demo

🚀 **Deployed at:** [Add your Vercel URL here after deployment]

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub)

### Features Complete

| Feature | Status |
|---------|--------|
| 🔐 Secure Authentication | ✅ Email/Password + OAuth |
| 👤 User Profiles | ✅ Role & Department management |
| 📅 Shift Management | ✅ Post, browse, filter shifts |
| 🔄 Swap Requests | ✅ Request & approve swaps |
| ✅ Manager Workflow | ✅ Approve/reject requests |
| 📆 Calendar View | ✅ Visual shift calendar |
| 🌙 Dark Mode | ✅ Beautiful dark theme |
| 📱 Responsive | ✅ Mobile & desktop ready |
| 🚀 Production Ready | ✅ Build passing |

---

<div align="center">

### 🎊 Congratulations!

**Your shift swap platform is ready to help real workers manage their schedules.**

Built with ❤️ for essential workers everywhere

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub)

</div>
