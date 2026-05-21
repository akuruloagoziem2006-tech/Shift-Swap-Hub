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
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [location, navigate] = useLocation();
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
        <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-2xl select-none">⇄</span>
        </div>
        <h1 className="text-2xl font-bold text-white">ShiftSwap</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            const showBadge =
              href === "/my-shifts" && stats && stats.incomingRequests > 0
                ? stats.incomingRequests
                : 0;

            return (
              <Button
                key={href}
                variant="ghost"
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "w-full justify-start gap-3 text-base py-6 font-medium",
                  isActive
                    ? "bg-zinc-800 text-white hover:bg-zinc-800"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
                onClick={() => {
                  navigate(href);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {showBadge > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                    {showBadge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 space-y-1">
        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-zinc-300 truncate flex-1">{displayName}</p>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:text-white py-5"
          onClick={handleThemeToggle}
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDark ? "Light mode" : "Dark mode"}
        </Button>

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 py-6"
          onClick={signOut}
          data-testid="button-sign-out"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-zinc-950 border-r border-zinc-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-72 bg-zinc-950 border-r border-zinc-800 shadow-2xl">
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
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800"
            data-testid="button-open-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold select-none">⇄</span>
            </div>
            <span className="font-bold text-lg text-white">ShiftSwap</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-900">
          {children}
        </main>
      </div>
    </div>
  );
}
