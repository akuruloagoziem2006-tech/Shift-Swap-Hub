'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, Mail } from 'lucide-react'
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
    const subject = encodeURIComponent('ShiftSwap Feedback')
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
            className="rounded-full h-14 w-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 p-0"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Send Feedback</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-card border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              Share Your Feedback
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              We'd love to hear from you! Share your thoughts, suggestions, or report any issues.
            </p>
            
            <div>
              <Label htmlFor="feedback-email" className="text-sm">Your Email (optional)</Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="feedback-message" className="text-sm">Your Feedback</Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1.5 min-h-[150px]"
              />
            </div>
            
            <Button 
              onClick={handleSendFeedback} 
              disabled={sending}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Mail className="mr-2 h-4 w-4" />
              {sending ? 'Sending...' : 'Send via Email'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Or email us directly at{' '}
              <a 
                href="mailto:akuruloagoziem2006@gmail.com" 
                className="text-emerald-500 hover:text-emerald-400"
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
