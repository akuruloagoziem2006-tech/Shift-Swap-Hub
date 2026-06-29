'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, List, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/post', label: 'Post Shift', icon: PlusCircle },
  { href: '/dashboard/browse', label: 'Browse Shifts', icon: List },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
            <span className="font-bold text-white">S</span>
          </div>
          <span className="font-bold text-2xl">ShiftSwap</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-teal-600 text-white' 
                  : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Button variant="ghost" className="mt-auto text-red-400 hover:text-red-500 justify-start gap-3">
        <LogOut className="w-5 h-5" />
        Logout
      </Button>
    </div>
  );
}
