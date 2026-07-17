import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Handle error parameters from OAuth providers
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (errorParam) {
    console.error('OAuth error:', errorParam, errorDescription)
    const errorUrl = new URL('/auth', requestUrl.origin)
    errorUrl.searchParams.set('error', errorParam)
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Session successfully created - cookies are set automatically by createServerClient
      console.log('Auth callback successful for user:', data.user.email)
      
      // Always redirect to dashboard after successful auth
      const redirectUrl = new URL('/dashboard', requestUrl.origin)
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    if (error) {
      console.error('Auth callback error:', error.message)
      const errorUrl = new URL('/auth', requestUrl.origin)
      errorUrl.searchParams.set('error', 'auth_error')
      errorUrl.searchParams.set('error_description', error.message)
      return NextResponse.redirect(errorUrl.toString())
    }
  }

  // No code provided, redirect to auth page with error
  const redirectUrl = new URL('/auth', requestUrl.origin)
  redirectUrl.searchParams.set('error', 'no_code')
  return NextResponse.redirect(redirectUrl.toString())
}
