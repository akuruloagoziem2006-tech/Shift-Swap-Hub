'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Shield, CheckCircle, Clock, Zap, Bell, Users, Star, Play, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80">ShiftSwap</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 font-medium">
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Zap className="size-4" />
            <span>Trusted by 10,000+ shift workers</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Swap shifts in seconds,
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              not phone calls
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The smarter way to manage shift swaps. Post shifts, find coverage, get approvals—all in one beautiful app.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8 h-12 text-base font-semibold shadow-xl shadow-emerald-500/25 group">
                Try Demo Free
                <Play className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base border-2 hover:bg-white/5">
                See How It Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['MK', 'JT', 'SL', 'AR', 'PW'].map((initials, i) => (
                  <div key={i} className="size-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-background flex items-center justify-center text-xs font-medium text-white shadow-lg">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">4.9/5 from 2,000+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 border-y border-border/50 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for shift management
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple tools that make shift swapping effortless for your entire team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { 
                icon: Clock, 
                title: 'Post Available Shifts', 
                desc: 'Share shifts in seconds with just a few taps',
                color: 'from-amber-500 to-orange-500'
              },
              { 
                icon: ArrowLeftRight, 
                title: 'Request Swaps', 
                desc: 'Find coverage easily from trusted colleagues',
                color: 'from-emerald-500 to-teal-500'
              },
              { 
                icon: Shield, 
                title: 'Manager Approvals', 
                desc: 'One-click approval keeps everyone covered',
                color: 'from-blue-500 to-indigo-500'
              },
              { 
                icon: Bell, 
                title: 'Real-time Updates', 
                desc: 'Never miss a request or approval notification',
                color: 'from-purple-500 to-pink-500'
              },
            ].map((feature, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
                <div className={`size-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="size-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Works in three simple steps
            </h2>
            <p className="text-muted-foreground text-lg">
              No complicated setup. No learning curve. Just shift swapping made easy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Post Your Shift',
                desc: 'Enter shift details—date, time, position—and post it in seconds.',
                icon: Clock,
                color: 'bg-amber-500/10 text-amber-500'
              },
              {
                step: '02',
                title: 'Colleagues Respond',
                desc: 'Your team sees available shifts and can request to cover them.',
                icon: Users,
                color: 'bg-emerald-500/10 text-emerald-500'
              },
              {
                step: '03',
                title: 'Manager Approves',
                desc: 'Quick approval finalizes the swap and notifies everyone.',
                icon: CheckCircle,
                color: 'bg-blue-500/10 text-blue-500'
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-7xl font-bold text-border/30 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <div className={`size-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start free, scale as your team grows. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Free */}
            <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm">For individuals getting started</p>
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
                <Button variant="outline" className="w-full border-2">Get Started</Button>
              </Link>
            </div>

            {/* Team */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-teal-500/5 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-semibold text-white shadow-lg">
                Most Popular
              </div>
              <div className="mb-6 pt-2">
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
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-medium">Start Free Trial</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300">
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
                <Button variant="outline" className="w-full border-2">Contact Sales</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-emerald-500/20">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="relative">
              <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-white/10 mb-6">
                <CheckCircle className="size-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to simplify your shift management?
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of shift workers who use ShiftSwap to manage their schedules effortlessly.
              </p>
              <Link href="/auth">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 h-12 text-base font-semibold shadow-xl group">
                  Try Demo Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold">ShiftSwap</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                The easiest way for shift-based teams to manage schedules and swap shifts.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="size-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Github className="size-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/akurulo-agoziem-839098427" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="size-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Linkedin className="size-5" />
                </a>
                <a 
                  href="mailto:akuruloagoziem2006@gmail.com" 
                  className="size-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Mail className="size-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/auth" className="hover:text-foreground transition-colors">Try Demo</Link></li>
                <li><Link href="/auth" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="mailto:akuruloagoziem2006@gmail.com" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="https://github.com/akuruloagoziem2006-tech/Shift-Swap-Hub" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="https://www.linkedin.com/in/akurulo-agoziem-839098427" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ShiftSwap v2.0. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with care for shift workers everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
