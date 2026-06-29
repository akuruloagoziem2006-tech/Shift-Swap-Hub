import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qvizpavpwezozwupvxxt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aXpwYXZwd2V6b3p3dXB2eHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzcwMzMsImV4cCI6MjA5NDk1MzAzM30.hwLmzaLfNganeeKWwep0LjRlhMKhBfSgN0gOdRt___o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
