'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Mail, Link2, CheckCircle, Users, Share2, UserPlus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const DEPARTMENTS = ['Healthcare', 'Retail', 'Warehouse', 'Security', 'Hospitality', 'Transportation', 'Manufacturing', 'Other']

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('employee')
  const [department, setDepartment] = useState('')
  
  // Invite state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/auth')
          return
        }

        setUserId(user.id)
        setEmail(user.email || '')
        setInviteLink(`${window.location.origin}/auth?tab=signup`)

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFullName(profile.full_name || '')
          setRole(profile.role || 'employee')
          setDepartment(profile.department || '')
        }
        
        // Check for invite tab in URL
        const tab = searchParams.get('tab')
        if (tab === 'invite') {
          setActiveTab('invite')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router, searchParams])

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName || null,
      role: role as 'employee' | 'manager' | 'admin',
      department: department || null,
    }, {
      onConflict: 'id'
    })

    if (upsertError) {
      console.error('Save error:', upsertError)
      setError(upsertError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Please enter an email address',
        description: 'Enter the email of the person you want to invite.',
        variant: 'destructive',
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: 'Invalid email address',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }

    setInviting(true)
    
    // Create mailto link with invite message
    const subject = encodeURIComponent('Join me on ShiftSwap!')
    const body = encodeURIComponent(
      `Hey!\n\nI've been using ShiftSwap to manage shift swaps at work and it's been really helpful.\n\nYou should join me! Click the link below to sign up:\n\n${inviteLink}\n\nSee you there!`
    )
    window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`
    
    toast({
      title: 'Opening email client',
      description: 'Your invite email will open in your email app.',
    })
    
    setInviting(false)
    setInviteEmail('')
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast({
      title: 'Link copied!',
      description: 'Share this link with your teammates.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on ShiftSwap',
          text: 'Join me on ShiftSwap - the easiest way to manage shift swaps!',
          url: inviteLink,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyInviteLink()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-500 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 text-emerald-500 text-sm">
          Profile saved successfully!
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invite Team
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <select 
                  id="department" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Invite Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Share ShiftSwap with your colleagues! Invite them via email or share the invite link directly.
              </p>
              
              {/* Invite via Email */}
              <div className="space-y-3">
                <Label htmlFor="invite-email">Invite by Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleInviteByEmail}
                    disabled={inviting}
                    className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                  >
                    {inviting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* Share Invite Link */}
              <div className="space-y-3">
                <Label>Share Invite Link</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={inviteLink}
                      readOnly
                      className="pl-10 pr-20 bg-secondary/50"
                    />
                  </div>
                  <Button 
                    onClick={copyInviteLink}
                    variant="outline"
                    className="px-3"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    onClick={shareInviteLink}
                    variant="outline"
                    className="px-3"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can sign up and join your team's shift management.
                </p>
              </div>
              
              {/* Share buttons for mobile */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Quick Share</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.location.href = `mailto:?subject=${encodeURIComponent('Join me on ShiftSwap!')}&body=${encodeURIComponent(`Join me on ShiftSwap! Sign up here: ${inviteLink}`)}`
                    }}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={shareInviteLink}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    More Options
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
