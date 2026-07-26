'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, ArrowLeftRight, Shield, CheckCircle, Clock, Star, Zap, Bell, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">ShiftSwap</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium mb-8">
            <Zap className="size-4" />
            <span>Built for shift-based teams</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Swap shifts effortlessly with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              trusted colleagues
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The simplest way to post available shifts, request swaps, and get manager approvals—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-10 h-12 text-base font-semibold shadow-xl shadow-emerald-500/25 w-full sm:w-auto">
                Get Started Free
                <ArrowLeftRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="px-10 h-12 text-base w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {['MK', 'JT', 'SL', 'AR', 'PW'].map((initials, i) => (
                <div key={i} className="size-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-background flex items-center justify-center text-xs font-medium text-white">
                  {initials}
                </div>
              ))}
            </div>
            <span>Trusted by 500+ shift workers</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Shifts Swapped', value: '10,000+' },
              { label: 'Active Teams', value: '150+' },
              { label: 'Time Saved', value: '500hrs/mo' },
              { label: 'Satisfaction', value: '98%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-500 mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage shifts
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From calendar views to approval workflows, ShiftSwap has your team covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Calendar className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                <p className="text-muted-foreground text-sm">
                  See all your shifts at a glance. Color-coded by type and status for easy planning.
                </p>
              </CardContent>
            </Card>

            {/* Shift Creation */}
            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Clock className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Post Shifts</h3>
                <p className="text-muted-foreground text-sm">
                  Post available shifts and let colleagues claim them. No more texting or scheduling conflicts.
                </p>
              </CardContent>
            </Card>

            {/* Swap Requests */}
            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <ArrowLeftRight className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Swap Requests</h3>
                <p className="text-muted-foreground text-sm">
                  Request to swap shifts with trusted colleagues. Track request status in real-time.
                </p>
              </CardContent>
            </Card>

            {/* Manager Approvals */}
            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Shield className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Manager Approvals</h3>
                <p className="text-muted-foreground text-sm">
                  Managers review and approve swap requests. Complete audit trail for compliance.
                </p>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Bell className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
                <p className="text-muted-foreground text-sm">
                  Get notified instantly when someone requests your shift or approves a swap.
                </p>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <BarChart3 className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Team Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Track shift coverage, swap patterns, and team performance with visual dashboards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to better shift management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Post or Request', desc: 'Post a shift you want to give away, or request a shift from a colleague.' },
              { step: 2, title: 'Match & Confirm', desc: 'Once matched, the swap goes to your manager for approval.' },
              { step: 3, title: 'Approved & Done', desc: 'Manager approves and everyone\'s calendar is updated automatically.' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                )}
                <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by shift workers and managers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Teams across healthcare, retail, hospitality, and more use ShiftSwap to simplify their scheduling.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Maria K.', role: 'Registered Nurse', quote: 'Finally, a simple way to handle shift swaps. Before ShiftSwap, it was endless group chats and missed messages.' },
              { name: 'James T.', role: 'Shift Manager', quote: 'Managing approvals used to be a nightmare. Now I can review and approve swap requests in seconds.' },
              { name: 'Sarah L.', role: 'Retail Team Lead', quote: 'Our team loves how easy it is to swap shifts. It\'s reduced scheduling conflicts by at least 80%.' },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 md:p-14 shadow-2xl shadow-emerald-500/20">
            <CheckCircle className="size-14 text-white/90 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to simplify your shift management?
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of shift workers who use ShiftSwap to manage their schedules.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 h-12 text-base font-semibold shadow-xl">
                Get Started Free
                <ArrowLeftRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold">ShiftSwap</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth" className="hover:text-foreground transition-colors">Get Started</Link>
            </nav>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} ShiftSwap. Simple shift management for teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
