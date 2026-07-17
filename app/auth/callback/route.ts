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
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Session successfully created and cookies set
      console.log('Auth callback successful for user:', data.user.email)
      
      // Redirect to dashboard or the requested next page
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }
    
    if (error) {
      console.error('Auth callback error:', error.message)
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code provided, redirect to auth page
  const redirectUrl = new URL('/auth', requestUrl.origin)
  redirectUrl.searchParams.set('error', 'no_code')
  redirectUrl.searchParams.set('error_description', 'No authorization code received')
  return NextResponse.redirect(redirectUrl)
}
