import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Clock, Users, Star } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar */}
      <nav className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl select-none">⇄</span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">ShiftSwap</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/sign-in">
              <Button variant="ghost" className="hidden md:flex" data-testid="link-sign-in-nav">Sign in</Button>
            </Link>
            <Link to="/sign-up">
              <Button className="bg-teal-600 hover:bg-teal-700" data-testid="link-sign-up-nav">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full px-4 py-1.5 mb-6 border">
            <span className="text-emerald-600 text-xs">●</span>
            <span className="text-sm font-medium">Built for Essential Workers</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Swap shifts.<br />
            <span className="text-teal-600">Cover gaps.</span><br />
            Work on your terms.
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            The smartest way for nurses, retail workers, warehouse staff, and security guards to swap shifts, pick up extra hours, and balance life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="text-lg px-10 py-7 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto" data-testid="button-hero-cta">
                Start for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 w-full sm:w-auto" data-testid="link-how-it-works-hero">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500 mt-4">No credit card required • Free plan available</p>
        </div>
      </section>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-6 py-12 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "12,400+", label: "Shifts covered" },
            { value: "8,200+", label: "Active workers" },
            { value: "9", label: "Industries" },
            { value: "47 min", label: "Avg. time to fill" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold text-teal-600">{value}</div>
              <div className="text-zinc-600 dark:text-zinc-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-white">Everything you need</h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">Built specifically for shift workers</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Profiles", desc: "Every worker has a verified job role and location." },
              { icon: Clock, title: "Real-time Feed", desc: "Shifts post instantly and get filled fast." },
              { icon: Users, title: "Direct Messaging", desc: "Chat with workers before approving a swap." },
              { icon: ArrowRight, title: "Swap or Cover", desc: "Post shifts you need covered or offer to work extra." },
              { icon: Shield, title: "Employer Disclaimer", desc: "All swaps require employer approval. We remind you every step." },
              { icon: Star, title: "Pro AI Matching", desc: "Priority AI suggestions for best-fit workers." },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="pt-8">
                  <feature.icon className="w-10 h-10 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-xl mb-2 text-zinc-900 dark:text-white">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-white">How it works</h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">Three simple steps between you and covered.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Post Your Shift", desc: "Fill in date, time, role and pay rate. Takes under 30 seconds." },
              { num: "02", title: "Get Matched", desc: "Workers in your area and role see your shift instantly." },
              { num: "03", title: "Approve & Confirm", desc: "Review applicants, chat if needed, and confirm. Your employer handles final approval." },
            ].map((step) => (
              <Card key={step.num} className="relative border-0 shadow-sm overflow-hidden">
                <CardContent className="pt-10">
                  <div className="text-7xl font-bold text-teal-100 dark:text-teal-950 absolute -top-6 left-6 select-none">{step.num}</div>
                  <h3 className="font-semibold text-2xl mb-3 relative text-zinc-900 dark:text-white">{step.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-zinc-900 dark:text-white">Real workers. Real results.</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Maria T.", role: "ICU Nurse, Chicago", text: "Found a cover for my kid's school play in under an hour. This app is a lifesaver." },
              { name: "DeShawn K.", role: "Warehouse Associate, Atlanta", text: "I pick up 2-3 extra shifts a week. Best side hustle I've found." },
              { name: "Priya S.", role: "Retail Supervisor, Houston", text: "Managing shift coverage used to be a nightmare. Now it's actually easy." },
            ].map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic mb-6 text-zinc-700 dark:text-zinc-300">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-zinc-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Pricing */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/20 text-white text-sm px-4 py-1 rounded-full mb-6">
            Limited time offer
          </div>

          <h2 className="text-5xl font-bold mb-4">
            Go Pro for life.<br />One payment.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Unlimited swaps · Priority AI matching · Advanced filters · Calendar export
          </p>

          <div className="text-6xl font-bold mb-8">
            $49{" "}
            <span className="text-2xl font-normal opacity-75">one-time</span>
          </div>

          <Link to="/pricing">
            <Button
              size="lg"
              className="bg-white text-teal-700 hover:bg-zinc-100 text-lg px-12 py-7 mb-6"
              data-testid="button-pricing-cta"
            >
              Upgrade to Lifetime Pro →
            </Button>
          </Link>

          <p className="text-sm opacity-75">No monthly fees. No surprises. Yours forever.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm mb-6">
            <strong className="text-zinc-300">Important:</strong> All shift swaps require approval from your employer.
            ShiftSwap is a matching platform only and is not responsible for employment decisions.
          </p>
          <p className="text-xs">&copy; 2026 ShiftSwap. Built for essential workers.</p>
        </div>
      </footer>
    </div>
  );
}
