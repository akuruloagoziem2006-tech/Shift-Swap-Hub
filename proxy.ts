import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Named export for Next.js 16+ compatibility
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Allow auth callback route to pass through (critical for OAuth)
  // This route exchanges code for session and sets cookies
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request })
  }

  // Skip auth check if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl.includes('placeholder') || 
      supabaseAnonKey.includes('placeholder')) {
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    // Refresh session - critical for OAuth flow
    const { data: { user } } = await supabase.auth.getUser()

    // Define route types
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const isAuthRoute = pathname.startsWith('/auth')
    const isApiRoute = pathname.startsWith('/api')

    // Protect dashboard routes - redirect to auth if not authenticated
    if (isDashboardRoute && !user) {
      const url = new URL('/auth', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth pages to dashboard
    // But only if not in the middle of OAuth flow
    if (isAuthRoute && user && !isApiRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Proxy error:', error)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
