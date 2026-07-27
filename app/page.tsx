'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowLeftRight, Shield, CheckCircle, Clock, Zap, Bell, BarChart3, MessageSquare, Settings, Layout, ChevronRight, Mail, Github } from 'lucide-react';

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
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium mb-8">
            <Zap className="size-4" />
            <span>Built for hospitals, restaurants, retail & more</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            The easiest way to swap shifts{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              without endless phone calls
            </span>{' '}
            or group chats
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Post available shifts, request swaps, and get manager approvals—in one place. No more scheduling headaches.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-10 h-12 text-base font-semibold shadow-xl shadow-emerald-500/25 w-full sm:w-auto">
                Get Started Free
                <ArrowLeftRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#screenshots">
              <Button size="lg" variant="outline" className="px-10 h-12 text-base w-full sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 px-6 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Clock, label: 'Post Available Shifts', desc: 'Share shifts in seconds' },
              { icon: ArrowLeftRight, label: 'Request Swaps', desc: 'Find coverage easily' },
              { icon: Shield, label: 'Manager Approvals', desc: 'One-click approval' },
              { icon: Bell, label: 'Real-time Updates', desc: 'Never miss a request' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="size-6 text-emerald-500" />
                </div>
                <div className="font-semibold mb-1">{feature.label}</div>
                <div className="text-sm text-muted-foreground">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section id="screenshots" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything your team needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, intuitive interfaces that make shift management a breeze.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Dashboard */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground ml-2">Dashboard</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Layout className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal Dashboard</h3>
                    <p className="text-sm text-muted-foreground">View your upcoming shifts and pending requests at a glance</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-500">5</div>
                    <div className="text-xs text-muted-foreground">My Shifts</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-500">2</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-500">12</div>
                    <div className="text-xs text-muted-foreground">Approved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground ml-2">Calendar View</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Calendar className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Shift Calendar</h3>
                    <p className="text-sm text-muted-foreground">Color-coded shifts with swap status visibility</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-muted-foreground py-1">{day}</div>
                  ))}
                  {[...Array(35)].map((_, i) => {
                    const hasShift = [2, 3, 9, 10, 16, 17, 18, 23, 24, 30].includes(i);
                    const isSwap = [10, 17, 24].includes(i);
                    return (
                      <div key={i} className={`py-2 rounded ${hasShift ? (isSwap ? 'bg-yellow-500/30 text-yellow-600 dark:text-yellow-400' : 'bg-emerald-500/30 text-emerald-600 dark:text-emerald-400') : ''}`}>
                        {i % 7 !== 0 && i < 30 ? i % 28 + 1 : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Request Swap */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground ml-2">Request Swap</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <MessageSquare className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Swap Requests</h3>
                    <p className="text-sm text-muted-foreground">Request coverage or offer your shift to colleagues</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-medium text-blue-500">JT</div>
                      <div>
                        <div className="font-medium text-sm">James T. requests your shift</div>
                        <div className="text-xs text-muted-foreground">Mon, Dec 18 • Morning</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-medium text-purple-500">SL</div>
                      <div>
                        <div className="font-medium text-sm">Sarah L. offers her shift</div>
                        <div className="text-xs text-muted-foreground">Wed, Dec 20 • Evening</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Approvals */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground ml-2">Manager Dashboard</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Settings className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Approval Workflow</h3>
                    <p className="text-sm text-muted-foreground">Review and approve swap requests with one click</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-medium text-emerald-500">MK</div>
                      <div className="text-sm">
                        <div className="font-medium">Maria K. ← John D.</div>
                        <div className="text-xs text-muted-foreground">Dec 18 → Dec 20</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-red-500">Decline</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful features for your team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage shifts without the headache.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Clock className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Post Available Shifts</h3>
                <p className="text-muted-foreground text-sm">
                  Post shifts you want to give away. Colleagues can claim them—no more group chat chaos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <ArrowLeftRight className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Swap Requests</h3>
                <p className="text-muted-foreground text-sm">
                  Request to swap shifts with colleagues. Track status in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Shield className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Manager Approvals</h3>
                <p className="text-muted-foreground text-sm">
                  Managers review and approve swap requests. Full visibility and control.
                </p>
              </CardContent>
            </Card>

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

            <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <BarChart3 className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Team Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Track shift coverage, swap patterns, and team performance with dashboards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free, upgrade as your team grows.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm">Perfect for small teams getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 10 team members', 'Unlimited shift posts', 'Basic calendar view', 'Email notifications', 'Mobile app access'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="block">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </div>

            {/* Team */}
            <div className="bg-card rounded-2xl border-2 border-emerald-500 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full text-xs font-medium text-white">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Team</h3>
                <p className="text-muted-foreground text-sm">For growing teams that need more</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/user/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited team members', 'Advanced analytics', 'Manager approval workflow', 'Slack & Teams integrations', 'Priority support', 'Custom shift categories'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Start Free Trial</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-muted-foreground text-sm">For organizations with complex needs</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Team', 'SSO & SAML integration', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise deployment option'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:akuruloagoziem2006@gmail.com?subject=Enterprise%20Inquiry" className="block">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </a>
            </div>
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
              Join teams across healthcare, retail, hospitality, and more who use ShiftSwap.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 h-12 text-base font-semibold shadow-xl">
                Get Started Free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold">ShiftSwap</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                The easiest way for shift-based teams to manage schedules and swap shifts.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="size-5" />
                </a>
                <a href="mailto:akuruloagoziem2006@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="size-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#screenshots" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><a href="/auth" className="hover:text-foreground transition-colors">Sign Up</a></li>
                <li><a href="/auth" className="hover:text-foreground transition-colors">Dashboard</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="mailto:akuruloagoziem2006@gmail.com" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ShiftSwap. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Simple shift management for teams everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
