'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, Search, CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface OnboardingGuideProps {
  userId: string
  onComplete?: () => void
}

export function OnboardingGuide({ userId, onComplete }: OnboardingGuideProps) {
  const [showGuide, setShowGuide] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, full_name')
        .eq('id', userId)
        .single()
      
      // Show guide if onboarding not completed or no shifts exist
      if (profile) {
        const { data: shifts } = await supabase
          .from('shifts')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        
        if (!profile.onboarding_completed || !profile.full_name || !shifts || shifts.length === 0) {
          setShowGuide(true)
        }
      } else {
        setShowGuide(true)
      }
    }
    
    checkOnboardingStatus()
  }, [userId, supabase])

  const handleComplete = async () => {
    // Mark onboarding as completed
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)
    
    setShowGuide(false)
    onComplete?.()
  }

  const steps = [
    {
      title: 'Post a Shift',
      description: 'Have a shift you need covered? Post it and let your colleagues know.',
      icon: PlusCircle,
      href: '/dashboard/post',
      cta: 'Post Your First Shift'
    },
    {
      title: 'Browse Available Shifts',
      description: 'Looking to pick up extra hours? Browse shifts posted by your colleagues.',
      icon: Search,
      href: '/dashboard/browse',
      cta: 'Browse Shifts'
    },
    {
      title: 'Get Approval',
      description: 'When someone requests your shift or you request theirs, approvals make it official.',
      icon: CheckCircle,
      href: '/dashboard/my-shifts',
      cta: 'View My Shifts'
    }
  ]

  if (!showGuide) return null

  return (
    <Dialog open={showGuide} onOpenChange={setShowGuide}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-emerald-500/10 rounded-full w-fit">
            <Sparkles className="h-8 w-8 text-emerald-500" />
          </div>
          <DialogTitle className="text-2xl">Welcome to ShiftSwap! 👋</DialogTitle>
          <DialogDescription className="text-base">
            Here's how to get started in 3 simple steps
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentStep 
                      ? 'bg-emerald-500 text-white' 
                      : index < currentStep 
                        ? 'bg-emerald-500/30 text-emerald-500' 
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-12 h-0.5 mx-1 ${
                      index < currentStep ? 'bg-emerald-500' : 'bg-secondary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Card */}
          <Card className="bg-secondary/30 border-emerald-500/20">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 p-3 bg-emerald-500/10 rounded-xl w-fit">
                {(() => {
                  const Icon = steps[currentStep].icon
                  return <Icon className="h-8 w-8 text-emerald-500" />
                })()}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Step {currentStep + 1}: {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {steps[currentStep].description}
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={steps[currentStep].href}>
                  {steps[currentStep].cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1)
                } else {
                  handleComplete()
                }
              }}
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={handleComplete}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
