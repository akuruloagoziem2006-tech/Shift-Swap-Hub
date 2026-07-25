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

export default function PostShift() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setError('Please sign in first')
      setLoading(false)
      return
    }

    // Format times - HTML time input gives HH:MM, we add :00 for seconds
    const formatTimeForDB = (time: string | null) => {
      if (!time) return null
      return time.length === 5 ? `${time}:00` : time
    }

    // Build shift data
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

    console.log('Inserting shift:', shiftData)

    // Insert shift
    const { data, error: insertError, status } = await supabase
      .from('shifts')
      .insert(shiftData)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(`Failed to post shift: ${insertError.message}`)
      setLoading(false)
      return
    }

    console.log('Shift inserted successfully:', data)
    setSuccess(true)
    
    // Redirect after short delay
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Post a Shift</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 mb-4 text-teal-500">
          Shift posted successfully! Redirecting...
        </div>
      )}

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
