'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, Search, CheckCircle, ArrowRight, Sparkles, Rocket } from 'lucide-react'
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, full_name')
        .eq('id', userId)
        .single()
      
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
      <DialogContent className="sm:max-w-lg bg-card border-border/50 p-0 overflow-hidden">
        <div className="bg-gradient-to-br blue-500/10 via-blue-500/5 to-transparent p-6 pb-0">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br blue-500 blue-500 rounded-2xl w-fit shadow-lg shadow-blue-500/25">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Welcome to ShiftSwap v2! 🚀</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Get started in 3 simple steps
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-gradient-to-br blue-500 blue-500 text-white shadow-lg shadow-blue-500/25 scale-110' 
                      : index < currentStep 
                        ? 'bg-blue-500/20 text-blue-500' 
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-16 h-1 mx-1 rounded-full transition-colors duration-300 ${
                      index < currentStep ? 'bg-gradient-to-r blue-500 blue-500' : 'bg-secondary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Card */}
          <Card className="bg-gradient-to-br from-secondary/50 to-secondary/20 border-border/50">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br blue-500/10 blue-500/10 rounded-2xl w-fit">
                {(() => {
                  const Icon = steps[currentStep].icon
                  return <Icon className="h-10 w-10 text-blue-500" />
                })()}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Step {currentStep + 1}: {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {steps[currentStep].description}
              </p>
              <Button asChild className="bg-gradient-to-r blue-500 blue-500 hover:from-blue-600 hover:to-blue-600 font-medium shadow-lg shadow-blue-500/20">
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
              className="text-muted-foreground"
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
              className="border-2"
            >
              {currentStep < steps.length - 1 ? 'Next Step' : "Let's Go!"}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
