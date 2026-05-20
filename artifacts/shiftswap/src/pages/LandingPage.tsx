import { Link } from "wouter";
import { ArrowRight, ArrowLeftRight, Shield, Clock, Users, Star, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const steps = [
  {
    step: "01",
    title: "Post Your Shift",
    desc: "Fill in the date, time, role and pay rate. It takes 30 seconds.",
  },
  {
    step: "02",
    title: "Get Matched",
    desc: "Workers in your area and role see your shift in their feed instantly.",
  },
  {
    step: "03",
    title: "Approve & Confirm",
    desc: "Review applicants, chat if needed, and confirm. Your employer handles the rest.",
  },
];

const testimonials = [
  {
    name: "Maria T.",
    role: "ICU Nurse, Chicago",
    quote: "Found a cover for my kid's school play in under an hour. This app is a lifesaver.",
    rating: 5,
  },
  {
    name: "DeShawn K.",
    role: "Warehouse Associate, Atlanta",
    quote: "I pick up 2-3 extra shifts a week. Best side hustle I've found.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Retail Supervisor, Houston",
    quote: "Managing shift coverage used to be a nightmare. Now it's actually easy.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ShiftSwap</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/sign-in">
              <Button variant="ghost" size="sm" data-testid="link-sign-in-nav">Sign In</Button>
            </Link>
            <Link to="/sign-up">
              <Button size="sm" data-testid="link-sign-up-nav">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        <Badge variant="secondary" className="mb-6 text-xs font-semibold uppercase tracking-wide px-3 py-1">
          Built for essential workers
        </Badge>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-6">
          Swap shifts.<br />
          <span className="text-primary">Cover gaps.</span><br />
          Work on your terms.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          ShiftSwap connects nurses, retail workers, warehouse staff, and security guards who need coverage with workers ready to pick up extra hours — fast and reliably.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/sign-up">
            <Button size="lg" className="text-base px-8 h-12 gap-2" data-testid="button-hero-cta">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2" data-testid="link-pricing-hero">
              <Zap className="w-4 h-4" /> See Pro features
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Free to start. No credit card required.</p>
      </section>

      {/* Stats strip */}
      <section className="bg-muted/50 border-y border-border py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Shifts covered", value: "12,400+" },
            { label: "Active workers", value: "8,200+" },
            { label: "Industries", value: "9" },
            { label: "Avg. time to fill", value: "47 min" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How it works</h2>
          <p className="text-muted-foreground text-lg">Three steps between you and covered.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <span className="text-5xl font-black text-primary/20 leading-none">{step}</span>
              <h3 className="text-lg font-bold text-foreground mt-2 mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Everything you need</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified profiles", desc: "Every worker has a verified job role and location." },
              { icon: Clock, title: "Real-time feed", desc: "Shifts post instantly and get filled fast." },
              { icon: Users, title: "Direct messaging", desc: "Chat with workers before approving a swap." },
              { icon: ArrowLeftRight, title: "Swap or cover", desc: "Post a swap you need covered or offer to work extra." },
              { icon: CheckCircle, title: "Employer disclaimer", desc: "All swaps require your employer's approval. We remind you every step." },
              { icon: Zap, title: "Pro matching", desc: "Pro members get AI-powered suggestions for best-fit workers." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Real workers. Real results.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, quote, rating }) => (
            <div key={name} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-foreground text-sm leading-relaxed mb-4">"{quote}"</blockquote>
              <div>
                <p className="font-semibold text-foreground text-sm">{name}</p>
                <p className="text-muted-foreground text-xs">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0">
            Limited time offer
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Go Pro for life. One payment.
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Unlimited swaps, priority matching, advanced filters and calendar export — forever, for $49.
          </p>
          <Link to="/pricing">
            <Button size="lg" variant="secondary" className="text-base px-8 h-12" data-testid="button-pricing-cta">
              View pricing <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <ArrowLeftRight className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">ShiftSwap</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            All shift swaps require employer approval. ShiftSwap is not responsible for scheduling decisions.
          </p>
          <p className="text-xs text-muted-foreground">&copy; 2026 ShiftSwap</p>
        </div>
      </footer>
    </div>
  );
}
