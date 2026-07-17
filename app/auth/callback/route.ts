import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Handle error parameters from OAuth providers (e.g., user denied access)
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (errorParam) {
    console.error('OAuth error:', errorParam, errorDescription)
    const errorUrl = new URL('/auth', requestUrl.origin)
    errorUrl.searchParams.set('error', encodeURIComponent(errorParam))
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', encodeURIComponent(errorDescription))
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  // No code - redirect to auth
  if (!code) {
    const redirectUrl = new URL('/auth', requestUrl.origin)
    redirectUrl.searchParams.set('error', 'no_code')
    return NextResponse.redirect(redirectUrl.toString())
  }

  // Create response with redirect to dashboard
  const redirectUrl = new URL('/dashboard', requestUrl.origin)
  let response = NextResponse.redirect(redirectUrl.toString())

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, {
              ...options,
              httpOnly: options?.httpOnly ?? true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: options?.sameSite ?? 'lax',
              path: options?.path ?? '/',
            })
          })
        },
      },
    }
  )

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Auth callback error:', error.message)
    const errorUrl = new URL('/auth', requestUrl.origin)
    errorUrl.searchParams.set('error', 'auth_error')
    errorUrl.searchParams.set('error_description', encodeURIComponent(error.message))
    return NextResponse.redirect(errorUrl.toString())
  }
  
  if (!data.user) {
    console.error('Auth callback: no user returned')
    const errorUrl = new URL('/auth', requestUrl.origin)
    errorUrl.searchParams.set('error', 'no_user')
    return NextResponse.redirect(errorUrl.toString())
  }

  console.log('Auth callback successful for user:', data.user.email)
  
  // Redirect to dashboard with cookies set
  return response
}
