'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const roleTypes = [
  'Nurse - RN',
  'Nurse - LPN',
  'Nurse - CNA',
  'Retail Associate',
  'Cashier',
  'Stock Associate',
  'Warehouse Worker',
  'Forklift Operator',
  'Security Guard',
  'Security Officer',
  'Other',
]

const shiftTypes = [
  { value: 'swap', label: 'Swap - Trade with another worker' },
  { value: 'cover', label: 'Cover - Need someone to fill in' },
  { value: 'pickup', label: 'Pick Up - Extra shift available' },
]

export default function PostShiftPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    roleType: '',
    payRate: '',
    shiftType: 'swap',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date) {
      toast.error('Please select a date')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to post a shift')
        return
      }

      const { error } = await supabase.from('shifts').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        shift_date: format(date, 'yyyy-MM-dd'),
        start_time: formData.startTime,
        end_time: formData.endTime,
        location: formData.location,
        role_type: formData.roleType,
        pay_rate: formData.payRate ? parseFloat(formData.payRate) : null,
        shift_type: formData.shiftType,
        status: 'open',
      })

      if (error) throw error

      toast.success('Shift posted successfully!')
      router.push('/dashboard/my-shifts')
    } catch (error) {
      console.error('Error posting shift:', error)
      toast.error('Failed to post shift. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Post a Shift</h1>
        <p className="text-muted-foreground mt-1">
          Create a new shift listing for others to swap, cover, or pick up.
        </p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Shift Details</CardTitle>
          <CardDescription>
            Provide the details about your shift so others can find and request it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Shift Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Morning Shift - Emergency Room"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-input/50"
              />
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <Label htmlFor="shiftType">Shift Type *</Label>
              <Select
                value={formData.shiftType}
                onValueChange={(value) => setFormData({ ...formData, shiftType: value })}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-input/50',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="bg-input/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="bg-input/50"
                />
              </div>
            </div>

            {/* Role Type */}
            <div className="space-y-2">
              <Label htmlFor="roleType">Job Role *</Label>
              <Select
                value={formData.roleType}
                onValueChange={(value) => setFormData({ ...formData, roleType: value })}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., City Hospital, Downtown Branch, Warehouse A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="bg-input/50"
              />
            </div>

            {/* Pay Rate */}
            <div className="space-y-2">
              <Label htmlFor="payRate">Hourly Pay Rate (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="payRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="25.00"
                  value={formData.payRate}
                  onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                  className="pl-7 bg-input/50"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Additional Details (optional)</Label>
              <Textarea
                id="description"
                placeholder="Any additional information about the shift, requirements, or notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="bg-input/50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 size-4" />
              )}
              Post Shift
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
