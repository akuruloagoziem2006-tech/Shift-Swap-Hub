'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Loader2, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

const jobRoles = [
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

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    job_role: '',
    location: '',
    preferred_days: [] as string[],
    hourly_rate: '',
    bio: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          setFormData({
            full_name: data.full_name || '',
            job_role: data.job_role || '',
            location: data.location || '',
            preferred_days: data.preferred_days || [],
            hourly_rate: data.hourly_rate?.toString() || '',
            bio: data.bio || '',
          })
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const calculateCompletion = () => {
    const fields = [
      formData.full_name,
      formData.job_role,
      formData.location,
      formData.preferred_days.length > 0,
      formData.hourly_rate,
      formData.bio,
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter(d => d !== day)
        : [...prev.preferred_days, day]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          job_role: formData.job_role || null,
          location: formData.location || null,
          preferred_days: formData.preferred_days.length > 0 ? formData.preferred_days : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          bio: formData.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const completion = calculateCompletion()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Complete your profile to get better shift matches and build trust with other users.
        </p>
      </div>

      {/* Profile Completion Card */}
      <Card className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-teal-500/10 text-teal-500 text-xl">
                {formData.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Profile Completion</h3>
                <span className="text-sm font-medium text-teal-500">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {completion === 100 
                  ? 'Great! Your profile is complete.'
                  : 'Complete your profile to unlock AI-powered shift matching.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5 text-teal-500" />
            Personal Information
          </CardTitle>
          <CardDescription>
            This information helps other workers learn about you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-input/50"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-input/50 opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here.
              </p>
            </div>

            {/* Job Role */}
            <div className="space-y-2">
              <Label htmlFor="job_role">Job Role</Label>
              <Select
                value={formData.job_role}
                onValueChange={(value) => setFormData({ ...formData, job_role: value })}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Select your primary role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Work Location</Label>
              <Input
                id="location"
                placeholder="e.g., City Hospital, Downtown Mall, Warehouse District"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-input/50"
              />
            </div>

            {/* Preferred Days */}
            <div className="space-y-3">
              <Label>Preferred Work Days</Label>
              <p className="text-sm text-muted-foreground">
                Select the days you&apos;re typically available for shifts.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <Checkbox
                      checked={formData.preferred_days.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Expected Hourly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="25.00"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="pl-7 bg-input/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This helps match you with shifts that meet your rate expectations.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others a bit about yourself, your experience, and what you're looking for..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="bg-input/50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
