import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Shield, Clock, Users, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Post up to 3 shifts/month',
      'Browse all available shifts',
      'Basic shift matching',
      'Email notifications',
    ],
    cta: 'Current Plan',
    popular: false,
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For active shift swappers',
    features: [
      'Unlimited shift posts',
      'AI-powered matching',
      'Priority in search results',
      'Real-time notifications',
      'Shift history & analytics',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    disabled: false,
  },
  {
    name: 'Team',
    price: '$29.99',
    period: '/month',
    description: 'For managers & teams',
    features: [
      'Everything in Pro',
      'Team management dashboard',
      'Bulk shift posting',
      'Advanced analytics',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
    disabled: false,
  },
]

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Our AI analyzes your preferences and history to suggest the perfect shifts.',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Get notified immediately when a shift matches your criteria.',
  },
  {
    icon: Shield,
    title: 'Verified Workers',
    description: 'All users are verified to ensure a safe and reliable community.',
  },
  {
    icon: Clock,
    title: 'Quick Responses',
    description: 'Average response time under 2 hours for shift requests.',
  },
]

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground mt-2">
          Choose the plan that works best for your shift swapping needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`bg-card/50 border-border/50 relative ${
              plan.popular ? 'ring-2 ring-teal-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-5 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-teal-600 hover:bg-teal-700' 
                    : plan.disabled 
                      ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                      : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.disabled}
              >
                {plan.cta}
                {!plan.disabled && <ArrowRight className="ml-2 size-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="pt-8">
        <h2 className="text-xl font-semibold text-foreground text-center mb-6">
          Why Choose ShiftSwap Pro?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="size-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="size-5 text-teal-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to level up your shift game?
            </h3>
            <p className="text-muted-foreground">
              Join thousands of workers who are already using ShiftSwap Pro.
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 shrink-0">
            <Users className="mr-2 size-4" />
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
