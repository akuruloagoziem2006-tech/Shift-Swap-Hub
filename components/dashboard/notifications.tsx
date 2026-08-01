'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Bell, CheckCircle, XCircle, ArrowLeftRight, Calendar, X, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'swap_request' | 'swap_approved' | 'swap_rejected'
  title: string
  message: string
  created_at: string
  read: boolean
  data?: any
}

interface NotificationsProps {
  userId: string
}

export function NotificationsPanel({ userId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [openShifts, setOpenShifts] = useState<Notification[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [userId])

  async function loadNotifications() {
    try {
      // Get pending swap requests received
      const { data: incomingRequests } = await supabase
        .from('shift_swap_requests')
        .select('*, shift:shifts(*), requester:profiles(*)')
        .eq('target_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      // Get outgoing request status changes
      const { data: outgoingRequests } = await supabase
        .from('shift_swap_requests')
        .select('*, shift:shifts(*), target:profiles(*)')
        .eq('requester_id', userId)
        .in('status', ['approved', 'rejected'])
        .order('updated_at', { ascending: false })

      // Transform incoming requests into notifications
      const incomingNotifications: Notification[] = (incomingRequests || []).map(req => ({
        id: `incoming-${req.id}`,
        type: 'swap_request' as const,
        title: 'New Swap Request',
        message: `${req.requester?.full_name || 'Someone'} wants to take your ${req.shift?.position || 'shift'}`,
        created_at: req.created_at,
        read: false,
        data: req
      }))

      // Transform status changes into notifications
      const outgoingNotifications: Notification[] = (outgoingRequests || []).map(req => ({
        id: `outgoing-${req.id}`,
        type: req.status === 'approved' ? 'swap_approved' as const : 'swap_rejected' as const,
        title: req.status === 'approved' ? 'Swap Approved! 🎉' : 'Swap Declined',
        message: `Your request for ${req.shift?.position || 'the shift'} was ${req.status}`,
        created_at: req.updated_at,
        read: false,
        data: req
      }))

      // Combine and sort by date
      const allNotifications = [...incomingNotifications, ...outgoingNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setNotifications(allNotifications)
      setOpenShifts(allNotifications.filter(n => !n.read))
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'swap_request':
        return <ArrowLeftRight className="h-5 w-5 text-amber-500" />
      case 'swap_approved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'swap_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const clearNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <Bell className="size-5" />
          <span className="hidden md:inline">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 md:top-1/2 md:right-2 md:translate-y-1/2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 ml-2">
                {unreadCount} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You'll see updates about your shift swaps here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-colors ${
                  !notification.read ? 'border-emerald-500/30 bg-emerald-500/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'swap_request' ? 'bg-amber-500/10' :
                      notification.type === 'swap_approved' ? 'bg-emerald-500/10' :
                      'bg-red-500/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-3">
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            router.push('/dashboard/my-shifts')
                            setOpen(false)
                          }}
                          className="text-emerald-500 hover:text-emerald-400"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Mobile-specific bell button that opens the notifications sheet
export function MobileNotificationsBell({ userId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [userId])

  async function loadNotifications() {
    try {
      const { data: incomingRequests } = await supabase
        .from('shift_swap_requests')
        .select('*, shift:shifts(*), requester:profiles(*)')
        .eq('target_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      const { data: outgoingRequests } = await supabase
        .from('shift_swap_requests')
        .select('*, shift:shifts(*), target:profiles(*)')
        .eq('requester_id', userId)
        .in('status', ['approved', 'rejected'])
        .order('updated_at', { ascending: false })

      const incomingNotifications: Notification[] = (incomingRequests || []).map(req => ({
        id: `incoming-${req.id}`,
        type: 'swap_request' as const,
        title: 'New Swap Request',
        message: `${req.requester?.full_name || 'Someone'} wants to take your ${req.shift?.position || 'shift'}`,
        created_at: req.created_at,
        read: false,
        data: req
      }))

      const outgoingNotifications: Notification[] = (outgoingRequests || []).map(req => ({
        id: `outgoing-${req.id}`,
        type: req.status === 'approved' ? 'swap_approved' as const : 'swap_rejected' as const,
        title: req.status === 'approved' ? 'Swap Approved! 🎉' : 'Swap Declined',
        message: `Your request for ${req.shift?.position || 'the shift'} was ${req.status}`,
        created_at: req.updated_at,
        read: false,
        data: req
      }))

      const allNotifications = [...incomingNotifications, ...outgoingNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setNotifications(allNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'swap_request':
        return <ArrowLeftRight className="h-5 w-5 text-amber-500" />
      case 'swap_approved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'swap_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const clearNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 ml-2">
                {unreadCount} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You'll see updates about your shift swaps here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-colors ${
                  !notification.read ? 'border-emerald-500/30 bg-emerald-500/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'swap_request' ? 'bg-amber-500/10' :
                      notification.type === 'swap_approved' ? 'bg-emerald-500/10' :
                      'bg-red-500/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-3">
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            router.push('/dashboard/my-shifts')
                            setOpen(false)
                          }}
                          className="text-emerald-500 hover:text-emerald-400"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
