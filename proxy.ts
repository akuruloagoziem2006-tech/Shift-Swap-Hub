import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Allow auth callback route to pass through without any auth checks
  // This route handles the OAuth code exchange
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request })
  }

  // Skip auth check if Supabase is not configured properly
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl.includes('placeholder') || 
      supabaseAnonKey.includes('placeholder')) {
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

    // Try to get user - this will use existing cookies
    const { data: { user }, error } = await supabase.auth.getUser()

    // Protect dashboard routes - redirect to /auth if not logged in
    if (pathname.startsWith('/dashboard') && !user) {
      const url = new URL('/auth', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Let the auth page handle redirecting logged-in users
    // Don't redirect here - let the client-side handle it
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
