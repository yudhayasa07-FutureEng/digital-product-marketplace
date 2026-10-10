import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const authCookieName = supabaseUrl
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : '';

function safeNextPath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\\\')
    ? path
    : '/dashboard';
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Login and OAuth callback must remain reachable without a session.
  if (
    pathname === '/auth/login' ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    /\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Fail closed: without the public Supabase configuration, do not expose app pages.
  if (!supabaseUrl || !supabaseAnonKey || !authCookieName) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
    }
    const loginUrl = new URL('/auth/login?error=config', request.url);
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: {
        getItem(key) {
          return request.cookies.get(key)?.value ?? null;
        },
        setItem(key, value) {
          request.cookies.set(key, value);
          response = NextResponse.next({ request });
          response.cookies.set(key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          });
        },
        removeItem(key) {
          request.cookies.delete(key);
          response = NextResponse.next({ request });
          response.cookies.set(key, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
          });
        },
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Login dengan Google diperlukan' }, { status: 401 });
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', safeNextPath(pathname + search));
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|robots.txt|sitemap.xml).*)'],
};
