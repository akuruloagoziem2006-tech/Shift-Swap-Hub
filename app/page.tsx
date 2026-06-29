'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-3xl font-bold">ShiftSwap</div>
          <Link href="/dashboard">
            <Button>Sign In</Button>
          </Link>
        </div>
      </nav>
      <div className="text-center py-32 px-6">
        <h1 className="text-6xl font-bold mb-6">ShiftSwap</h1>
        <p className="text-2xl text-zinc-400 mb-10">Swap shifts easily with trusted colleagues</p>
        <Link href="/dashboard">
          <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-10">
            Get Started Free
          </Button>
        </Link>
      </div>
    </div>
  );
}
