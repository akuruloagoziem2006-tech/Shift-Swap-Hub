import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  PlusCircle,
  List,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  ArrowLeftRight,
  Bell,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { getTheme, setTheme } from "@/lib/theme";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shifts", label: "Browse Shifts", icon: List },
  { href: "/shifts/new", label: "Post a Shift", icon: PlusCircle },
  { href: "/my-shifts", label: "My Shifts", icon: ArrowLeftRight },
  { href: "/my-requests", label: "My Requests", icon: Bell },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/pricing", label: "Go Pro", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(getTheme() === "dark");
  const { data: stats } = useGetDashboardStats();

  const handleThemeToggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    setIsDark(next === "dark");
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User";
  const initials = displayName[0]?.toUpperCase() ?? "U";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-800">
        <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xl select-none">⇄</span>
        </div>
        <span className="font-semibold text-lg text-white">ShiftSwap</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
          const showBadge =
            href === "/my-shifts" && stats && stats.incomingRequests > 0
              ? stats.incomingRequests
              : 0;

          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                  {showBadge}
                </Badge>
              )}
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800 space-y-1">
        <button
          onClick={handleThemeToggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 w-full transition-colors"
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="text-xs bg-teal-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">{displayName}</p>
          </div>
          <button
            onClick={signOut}
            className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
            data-testid="button-sign-out"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-72 bg-zinc-900 border-r border-zinc-800 shadow-2xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800"
            data-testid="button-open-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm select-none">⇄</span>
            </div>
            <span className="font-semibold text-white">ShiftSwap</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-900">
          {children}
        </main>
      </div>
    </div>
  );
}
