import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, PlusCircle, Calendar, TrendingUp, Users, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { count: openShiftsCount } = await supabase
    .from('shifts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  const { count: myShiftsCount } = await supabase
    .from('shifts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  const quickActions = [
    {
      title: 'Browse Shifts',
      description: 'Find available shifts to pick up',
      icon: Search,
      href: '/dashboard/browse',
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
    },
    {
      title: 'Post a Shift',
      description: 'Need someone to cover your shift?',
      icon: PlusCircle,
      href: '/dashboard/post',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'My Shifts',
      description: 'Manage your posted shifts',
      icon: Calendar,
      href: '/dashboard/my-shifts',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ]

  const stats = [
    {
      label: 'Open Shifts',
      value: openShiftsCount || 0,
      icon: TrendingUp,
      description: 'Available now',
    },
    {
      label: 'My Posted Shifts',
      value: myShiftsCount || 0,
      icon: Calendar,
      description: 'Active listings',
    },
    {
      label: 'Active Users',
      value: '1.2K+',
      icon: Users,
      description: 'This month',
    },
    {
      label: 'Avg Response',
      value: '< 2h',
      icon: Clock,
      description: 'To shift requests',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's what's happening with your shifts today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <stat.icon className="size-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="bg-card/50 border-border/50 hover:border-teal-500/50 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className={`size-10 rounded-lg ${action.bg} flex items-center justify-center mb-2`}>
                  <action.icon className={`size-5 ${action.color}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={action.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Profile Completion Banner */}
      {!profile?.job_role && (
        <Card className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-teal-500/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div>
              <h3 className="font-semibold text-foreground">Complete your profile</h3>
              <p className="text-sm text-muted-foreground">
                Add your job role and preferences to get better shift matches.
              </p>
            </div>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 shrink-0">
              <Link href="/dashboard/profile">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
