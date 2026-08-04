'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, Mail, Sparkles } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function FloatingFeedbackButton() {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      toast({
        title: 'Please enter feedback',
        description: 'Your feedback helps us improve ShiftSwap.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    
    // Create mailto link with feedback
    const subject = encodeURIComponent('ShiftSwap v2 Feedback')
    const body = encodeURIComponent(
      `Feedback:\n${feedback}\n\n---\nFrom: ${email || 'Anonymous'}`
    )
    window.location.href = `mailto:akuruloagoziem2006@gmail.com?subject=${subject}&body=${body}`
    
    toast({
      title: 'Opening email client',
      description: 'Your feedback will be sent via email.',
    })
    
    setSending(false)
    setOpen(false)
    setFeedback('')
    setEmail('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 bg-gradient-to-r blue-500 blue-500 hover:from-blue-600 hover:to-blue-600 shadow-xl shadow-blue-500/25 p-0 group"
          >
            <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Send Feedback</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-card border-border w-full sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br blue-500 blue-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <SheetTitle className="text-lg">Share Your Feedback</SheetTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              We'd love to hear from you! Help us improve ShiftSwap v2.
            </p>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="feedback-email" className="text-sm font-medium">Your Email (optional)</Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-secondary/50"
              />
            </div>
            
            <div>
              <Label htmlFor="feedback-message" className="text-sm font-medium">Your Feedback</Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think... What works well? What could be better?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1.5 min-h-[150px] bg-secondary/50"
              />
            </div>
            
            <Button 
              onClick={handleSendFeedback} 
              disabled={sending}
              className="w-full bg-gradient-to-r blue-500 blue-500 hover:from-blue-600 hover:to-blue-600 font-medium"
            >
              <Mail className="mr-2 h-4 w-4" />
              {sending ? 'Opening email...' : 'Send Feedback'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Or email us directly at{' '}
              <a 
                href="mailto:akuruloagoziem2006@gmail.com" 
                className="text-blue-500 hover:text-blue-400 font-medium"
              >
                akuruloagoziem2006@gmail.com
              </a>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
