# ShiftSwap Hub

A modern shift swap management platform for essential workers. Built with Next.js, shadcn/ui, and Supabase.

![ShiftSwap](https://via.placeholder.com/1200x630/1a1a1a/14b8a6?text=ShiftSwap+Hub)

## Features

- **Browse Available Shifts** - View all open shifts available for swap
- **Post Shifts** - Offer your shifts for others to pick up
- **Request Swaps** - Send swap requests to colleagues
- **Manager Approval** - Built-in approval workflow for managers
- **Interactive Calendar** - Visual monthly calendar with all shifts
- **Real-time Updates** - Live shift status updates via Supabase
- **Responsive Design** - Works on desktop and mobile devices
- **Dark Mode** - Modern dark theme optimized for night shifts

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + Radix UI
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: React Hook Form + Zod

## Project Structure

```
shift-swap-hub/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Protected dashboard pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   └── layout/              # Layout components
├── lib/                     # Utilities and configs
│   ├── supabase/            # Supabase client helpers
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
├── middleware.ts            # Auth middleware
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- A Supabase project

### Environment Variables

**✅ Already configured** - The `.env.local` file has been set up with your Supabase project credentials.

If you need to update them manually, create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qvizpavpwezozwupvxxt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or copy from the example:
```bash
cp .env.example .env.local
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup ⚠️

**⚠️ Important:** Before using the app, you must create the database tables in Supabase:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/qvizpavpwezozwupvxxt/sql/new)
2. Copy and paste the SQL below
3. Click "Run" to execute

Alternatively, use the prepared SQL file: [`SETUP_DATABASE.sql`](./SETUP_DATABASE.sql)

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- ============================================
-- SHIFT-SWAP-HUB DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'open', 'filled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift swap requests table
CREATE TABLE IF NOT EXISTS shift_swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for shifts
DROP POLICY IF EXISTS "Users can view shifts" ON shifts;
CREATE POLICY "Users can view shifts" ON shifts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create shifts" ON shifts;
CREATE POLICY "Users can create shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;
CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Managers can update any shifts" ON shifts;
CREATE POLICY "Managers can update any shifts" ON shifts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Create policies for swap requests
DROP POLICY IF EXISTS "Users can view swap requests" ON shift_swap_requests;
CREATE POLICY "Users can view swap requests" ON shift_swap_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create swap requests" ON shift_swap_requests;
CREATE POLICY "Users can create swap requests" ON shift_swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
DROP POLICY IF EXISTS "Users can update own requests" ON shift_swap_requests;
CREATE POLICY "Users can update own requests" ON shift_swap_requests FOR UPDATE USING (auth.uid() = requester_id);
DROP POLICY IF EXISTS "Managers can update any requests" ON shift_swap_requests;
CREATE POLICY "Managers can update any requests" ON shift_swap_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
);

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample shifts (uncomment and modify as needed)
-- Note: Replace 'YOUR_USER_ID' with an actual user ID from auth.users

/*
INSERT INTO shifts (user_id, date, start_time, end_time, position, department, location, status) VALUES
  ('YOUR_USER_ID', CURRENT_DATE + 1, '09:00', '17:00', 'Cashier', 'Retail', 'Downtown Store', 'scheduled'),
  ('YOUR_USER_ID', CURRENT_DATE + 3, '14:00', '22:00', 'Cashier', 'Retail', 'Mall Location', 'open'),
  ('YOUR_USER_ID', CURRENT_DATE + 5, '08:00', '16:00', 'Nurse', 'Healthcare', 'City Hospital', 'scheduled');
*/
```

## Features Overview

### Dashboard Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard with overview stats |
| `/dashboard/calendar` | Interactive calendar view of all shifts |
| `/dashboard/browse` | Browse and filter available shifts |
| `/dashboard/post` | Post a new shift for swap |
| `/dashboard/my-shifts` | View and manage your shifts |
| `/dashboard/profile` | Edit your profile settings |
| `/dashboard/manager` | Manager approval workflow (manager/admin only) |

### User Roles

- **Employee**: Browse shifts, request swaps, manage own shifts
- **Manager**: All employee features + approve/reject swap requests
- **Admin**: Full system access including user management

### Authentication

The app uses Supabase Auth with email magic links and OAuth providers. Protected routes are handled by middleware.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Using Vercel CLI
vercel
vercel --prod  # Production deployment
```

### Manual Deployment

```bash
# Build the project
pnpm build

# Start production server
pnpm start
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

## License

MIT License - see LICENSE file for details.

## Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/1200x800/1a1a1a/14b8a6?text=Dashboard+View)

### Browse Shifts
![Browse](https://via.placeholder.com/1200x800/1a1a1a/14b8a6?text=Browse+Shifts)

### Mobile View
![Mobile](https://via.placeholder.com/400x800/1a1a1a/14b8a6?text=Mobile+View)

---

## Remaining Todos

### High Priority
- [ ] Email notifications when swap requests are sent/approved/rejected
- [ ] User management page for admins
- [ ] Real-time subscriptions for live updates

### Medium Priority
- [ ] Chat/messaging between users
- [ ] Shift conflict detection
- [ ] Mobile app (React Native or PWA)
- [ ] Analytics dashboard for managers

### Nice to Have
- [ ] Export shifts to calendar (ICS)
- [ ] Shift reminders/notifications
- [ ] Custom shift categories
- [ ] Multi-location support
- [ ] Shift trading marketplace

---

Built with ❤️ for essential workers everywhere
