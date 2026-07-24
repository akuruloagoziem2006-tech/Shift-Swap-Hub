'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

const DEPARTMENTS = ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'Retail', 'Warehouse', 'Security', 'Food Service']

// Format time from HH:MM to HH:MM:SS for PostgreSQL TIME type
function formatTime(time: string | null): string | null {
  if (!time) return null
  // If already in HH:MM:SS format, return as is
  if (time.match(/^\d{2}:\d{2}:\d{2}$/)) return time
  // Convert HH:MM to HH:MM:SS
  return `${time}:00`
}

export default function PostShift() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setError('Please sign in first')
      setLoading(false)
      return
    }

    const startTime = formData.get('start_time') as string
    const endTime = formData.get('end_time') as string

    // Insert shift with properly formatted time
    const { error: insertError } = await supabase.from('shifts').insert({
      user_id: user.id,
      date: formData.get('date'),
      start_time: formatTime(startTime),
      end_time: formatTime(endTime),
      position: formData.get('position'),
      department: formData.get('department'),
      location: formData.get('location') || null,
      notes: formData.get('notes') || null,
      status: 'open',
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Post a Shift</h1>

      <Card>
        <CardHeader>
          <CardTitle>Shift Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" required />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <select 
                id="department" 
                name="department" 
                required 
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="position">Position *</Label>
              <Input id="position" name="position" placeholder="e.g. Nurse, Cashier" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input id="start_time" name="start_time" type="time" required />
              </div>
              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input id="end_time" name="end_time" type="time" required />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g. Main Office" />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Additional info..." className="min-h-[80px]" />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Posting...' : 'Post Shift'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
