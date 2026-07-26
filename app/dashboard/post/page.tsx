'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Calendar, MapPin, Clock, Briefcase } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const DEPARTMENTS = ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'Retail', 'Warehouse', 'Security', 'Food Service']

export default function PostShift() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
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

    toast({
      title: 'Shift posted! 🎉',
      description: 'Your shift is now available for swap.',
    })
    
    router.push('/dashboard')
    router.refresh()
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
                <Calendar className="w-4 h-4" />
                Date *
              </Label>
              <Input id="date" name="date" type="date" required min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
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
                <Briefcase className="w-4 h-4" />
                Position *
              </Label>
              <Input id="position" name="position" placeholder="e.g. Nurse, Cashier" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Start Time *
                </Label>
                <Input id="start_time" name="start_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  End Time *
                </Label>
                <Input id="end_time" name="end_time" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input id="location" name="location" placeholder="e.g. Main Office" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any additional information about this shift..." className="min-h-[100px]" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Shift'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
