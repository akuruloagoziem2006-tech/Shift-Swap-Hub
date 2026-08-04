import type { Metadata } from 'next';
import '@/globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'ShiftSwap v2 - Smart Shift Management',
  description: 'The smarter way to swap shifts. Post shifts, find coverage, get approvals—all in one beautiful app.',
  keywords: ['shift swap', 'work scheduling', 'team management', 'shift planning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
