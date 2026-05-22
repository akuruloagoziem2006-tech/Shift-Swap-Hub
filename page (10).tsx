import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Shield, 
  Sparkles, 
  Clock,
  Building2,
  Stethoscope,
  ShoppingBag,
  Warehouse
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Our smart algorithm matches you with shifts that fit your schedule and preferences.',
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Get instant notifications when new shifts are posted or requests are approved.',
  },
  {
    icon: Shield,
    title: 'Verified Workers',
    description: 'All users are verified to ensure a safe and trustworthy community.',
  },
  {
    icon: Users,
    title: 'Growing Community',
    description: 'Join thousands of workers already swapping shifts successfully.',
  },
]

const industries = [
  { icon: Stethoscope, name: 'Healthcare', description: 'Nurses, CNAs, Medical Staff' },
  { icon: ShoppingBag, name: 'Retail', description: 'Associates, Cashiers, Stock' },
  { icon: Warehouse, name: 'Warehouse', description: 'Workers, Operators, Packers' },
  { icon: Building2, name: 'Security', description: 'Guards, Officers, Patrol' },
]

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Shifts Swapped' },
  { value: '< 2hr', label: 'Avg Response Time' },
  { value: '4.9/5', label: 'User Rating' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">ShiftSwap</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#industries" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Industries
            </Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 px-4 py-1.5">
              <Sparkles className="size-3.5 mr-1.5" />
              AI-Powered Shift Swapping
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              The Easiest Way to{' '}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Swap Shifts
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Whether you need to cover a shift, swap with a coworker, or pick up extra hours, 
              ShiftSwap connects you with verified workers in your industry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-base px-8">
                <Link href="/auth/signup">
                  Start Swapping Free
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8">
                <Link href="/dashboard/browse">Browse Shifts</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/50 border-border/50">
                <CardContent className="py-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Workers Love ShiftSwap
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built by shift workers, for shift workers. We understand the challenges of 
              managing your schedule.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="size-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-teal-500" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built for Your Industry
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ShiftSwap is designed for workers across multiple industries who rely on 
              flexible scheduling.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <Card 
                key={industry.name} 
                className="bg-card/50 border-border/50 hover:border-teal-500/30 transition-colors cursor-pointer"
              >
                <CardContent className="py-8 text-center">
                  <div className="size-14 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                    <industry.icon className="size-7 text-teal-500" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{industry.name}</h3>
                  <p className="text-sm text-muted-foreground">{industry.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-blue-500/10 border-teal-500/20">
            <CardContent className="py-12 px-6 sm:px-12 text-center">
              <Calendar className="size-12 text-teal-500 mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ready to Take Control of Your Schedule?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of workers who are already swapping shifts, covering for each other, 
                and picking up extra hours with ease.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-base px-8">
                  <Link href="/auth/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-foreground">ShiftSwap</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ShiftSwap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
