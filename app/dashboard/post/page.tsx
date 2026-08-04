'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Calendar, MapPin, Clock, Briefcase, CheckCircle, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const DEPARTMENTS = ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'Retail', 'Warehouse', 'Security', 'Food Service']

export default function PostShift() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [postedShift, setPostedShift] = useState<any>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in first',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    const formatTimeForDB = (time: string | null) => {
      if (!time) return null
      return time.length === 5 ? `${time}:00` : time
    }

    const shiftData = {
      user_id: user.id,
      date: formData.get('date'),
      start_time: formatTimeForDB(formData.get('start_time') as string),
      end_time: formatTimeForDB(formData.get('end_time') as string),
      position: formData.get('position'),
      department: formData.get('department'),
      location: formData.get('location') || null,
      notes: formData.get('notes') || null,
      status: 'open',
    }

    const { data, error: insertError } = await supabase
      .from('shifts')
      .insert(shiftData)
      .select()
      .single()

    if (insertError) {
      toast({
        title: 'Error',
        description: `Failed to post shift: ${insertError.message}`,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    setPostedShift(data)
    setSuccess(true)
    setLoading(false)
  }

  const handlePostAnother = () => {
    setSuccess(false)
    setPostedShift(null)
  }

  // Show success state
  if (success && postedShift) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="size-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Shift Posted Successfully!</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your shift has been posted and is now visible to your team. You'll be notified when someone requests to cover it.
            </p>
            
            <div className="bg-card border rounded-xl p-4 mb-6 text-left max-w-sm mx-auto">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Posted Shift</h3>
              <div className="space-y-2">
                <p className="font-medium">{postedShift.position}</p>
                <p className="text-sm text-muted-foreground">{postedShift.department}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>{new Date(postedShift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  <span>{postedShift.start_time?.slice(0, 5)} - {postedShift.end_time?.slice(0, 5)}</span>
                </div>
                {postedShift.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{postedShift.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard/my-shifts">
                  View My Shifts
                </Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/browse">
                  Browse Available Shifts
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            
            <button 
              onClick={handlePostAnother}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Post another shift
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Post a Shift</h1>
        <p className="text-muted-foreground">Fill in the details below to post your shift for swap</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Shift Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Shift Date *
              </Label>
              <Input id="date" name="date" type="date" required min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Start Time *
                </Label>
                <Input id="start_time" name="start_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  End Time *
                </Label>
                <Input id="end_time" name="end_time" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Department *
              </Label>
              <select 
                id="department" 
                name="department" 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Job Title *
              </Label>
              <Input id="position" name="position" placeholder="e.g. Nurse, Cashier, Server" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <Input id="location" name="location" placeholder="e.g. Hospital Main, Downtown Store" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                Additional Notes <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <Textarea id="notes" name="notes" placeholder="Any additional information your colleagues should know about this shift..." className="min-h-[80px]" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    Post Shift
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
