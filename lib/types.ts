import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'employee' | 'manager' | 'admin'
  department: string | null
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  position: string
  department: string
  location: string | null
  notes: string | null
  status: 'scheduled' | 'open' | 'filled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  user?: Profile
}

export interface ShiftSwapRequest {
  id: string
  shift_id: string
  requester_id: string
  target_user_id: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  message: string | null
  created_at: string
  updated_at: string
  shift?: Shift
  requester?: Profile
  target_user?: Profile
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      shifts: {
        Row: Shift
        Insert: Omit<Shift, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Shift, 'id' | 'created_at'>>
      }
      shift_swap_requests: {
        Row: ShiftSwapRequest
        Insert: Omit<ShiftSwapRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ShiftSwapRequest, 'id' | 'created_at'>>
      }
    }
  }
}

export type ShiftStatus = Shift['status']
export type SwapRequestStatus = ShiftSwapRequest['status']
export type UserRole = Profile['role']
