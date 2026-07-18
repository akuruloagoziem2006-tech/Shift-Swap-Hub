'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, ArrowLeftRight, Shield, CheckCircle, Clock, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShiftSwap</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-8">
            <Clock className="size-4" />
            <span>Built for shift-based teams</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Swap shifts easily with{' '}
            <span className="bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
              trusted colleagues
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            ShiftSwap makes it simple to post available shifts, request swaps, and get manager approvals—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-12 text-base w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 px-8 h-12 text-base w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to manage shifts
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              From calendar views to approval workflows, ShiftSwap has your team covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="size-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <Calendar className="size-6 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Calendar View</h3>
              <p className="text-zinc-400 text-sm">
                See all your shifts at a glance. Color-coded by type and status for easy planning.
              </p>
            </div>

            {/* Shift Creation */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="size-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <Clock className="size-6 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Post Shifts</h3>
              <p className="text-zinc-400 text-sm">
                Post available shifts and let colleagues claim them. No more texting or scheduling conflicts.
              </p>
            </div>

            {/* Swap Requests */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="size-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <ArrowLeftRight className="size-6 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Swap Requests</h3>
              <p className="text-zinc-400 text-sm">
                Request to swap shifts with trusted colleagues. Track request status in real-time.
              </p>
            </div>

            {/* Manager Approvals */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
              <div className="size-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <Shield className="size-6 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manager Approvals</h3>
              <p className="text-zinc-400 text-sm">
                Managers review and approve swap requests. Complete audit trail for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-zinc-400 text-lg">
              Three simple steps to better shift management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="size-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-teal-500">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Post or Request</h3>
              <p className="text-zinc-400">
                Post a shift you want to give away, or request a shift from a colleague.
              </p>
            </div>
            
            <div className="text-center">
              <div className="size-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-teal-500">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Match & Confirm</h3>
              <p className="text-zinc-400">
                Once matched, the swap goes to your manager for approval.
              </p>
            </div>
            
            <div className="text-center">
              <div className="size-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-teal-500">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Approved & Done</h3>
              <p className="text-zinc-400">
                Manager approves and everyone's calendar is updated automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by shift workers and managers
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Teams across healthcare, retail, hospitality, and more use ShiftSwap to simplify their scheduling.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-4">
                "Finally, a simple way to handle shift swaps. Before ShiftSwap, it was endless group chats and missed messages."
              </p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-zinc-400">MK</span>
                </div>
                <div>
                  <p className="text-white font-medium">Maria K.</p>
                  <p className="text-zinc-500 text-sm">Registered Nurse</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-4">
                "Managing approvals used to be a nightmare. Now I can review and approve swap requests in seconds."
              </p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-zinc-400">JT</span>
                </div>
                <div>
                  <p className="text-white font-medium">James T.</p>
                  <p className="text-zinc-500 text-sm">Shift Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-4">
                "Our team loves how easy it is to swap shifts. It's reduced scheduling conflicts by at least 80%."
              </p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-zinc-400">SL</span>
                </div>
                <div>
                  <p className="text-white font-medium">Sarah L.</p>
                  <p className="text-zinc-500 text-sm">Retail Team Lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-12">
            <CheckCircle className="size-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to simplify your shift management?
            </h2>
            <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of shift workers who use ShiftSwap to manage their schedules.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-zinc-100 px-8 h-12 text-base font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-white">ShiftSwap</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} ShiftSwap. Simple shift management for teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
