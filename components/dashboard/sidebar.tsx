'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Home,
  Search,
  PlusCircle,
  Calendar,
  User,
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  CheckSquare,
  CalendarDays,
  Bell,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { NotificationsPanel, MobileNotificationsBell } from './notifications'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'employee' | 'manager' | 'admin' | null
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)
      }
    }
    loadProfile()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isManager = profile?.role === 'manager' || profile?.role === 'admin'

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Browse Shifts', href: '/dashboard/browse', icon: Search },
    { name: 'Post a Shift', href: '/dashboard/post', icon: PlusCircle },
    { name: 'My Shifts', href: '/dashboard/my-shifts', icon: Calendar },
    ...(isManager ? [{ name: 'Approvals', href: '/dashboard/manager', icon: CheckSquare }] : []),
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Invite Team', href: '/dashboard/profile?tab=invite', icon: Users },
  ]

  const NavLinks = ({ onNavigate, showNotifications = true }: { onNavigate?: () => void, showNotifications?: boolean }) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r blue-500/10 blue-500/10 text-blue-500 border-l-2 border-blue-500'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            )}
          >
            <item.icon className="size-5" />
            {item.name}
            {isActive && <ChevronRight className="ml-auto size-4 opacity-60" />}
          </Link>
        )
      })}

      {/* Notifications */}
      {showNotifications && userId && (
        <div className="pt-4 mt-4 border-t border-border/50">
          <NotificationsPanel userId={userId} />
        </div>
      )}
    </nav>
  )

  const UserSection = () => (
    <div className="border-t border-border/50 p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 h-auto hover:bg-secondary/80 transition-colors rounded-lg">
            <Avatar className="size-9 ring-2 ring-blue-500/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br blue-500 blue-500 text-white font-medium">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isManager ? 'Manager' : 'Employee'}
              </p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/profile?tab=invite" className="flex items-center gap-2">
              <Users className="size-4" />
              Invite Team
            </Link>
          </DropdownMenuItem>
          {isManager && (
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/manager" className="flex items-center gap-2">
                <Shield className="size-4" />
                Manager Panel
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
            <LogOut className="size-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-gradient-to-br blue-500 blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">ShiftSwap</span>
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">v2</span>
        </div>
        <NavLinks />
        <UserSection />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br blue-500 blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">ShiftSwap</span>
          </Link>
          <div className="flex items-center gap-1">
            {/* Mobile Notifications Bell - opens notifications panel */}
            {userId && <MobileNotificationsBell userId={userId} />}
            {/* Hamburger Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-sidebar-border">
                  <div className="size-9 rounded-xl bg-gradient-to-br blue-500 blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-lg font-bold text-sidebar-foreground">ShiftSwap</span>
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <UserSection />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
