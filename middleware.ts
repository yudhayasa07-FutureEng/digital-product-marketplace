import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const authCookieName = supabaseUrl
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : '';

function safeNextPath(path: string) {
  return path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes(String.fromCharCode(92))
    ? path
    : '/dashboard';
}

function isVerifiedGoogleUser(user: {
  app_metadata?: Record<string, unknown>;
  identities?: Array<{ provider?: string }> | null;
  email?: string;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
}) {
  const provider = user.app_metadata?.provider;
  const hasGoogleIdentity = user.identities?.some((identity) => identity.provider === 'google') ?? false;
  const emailIsVerified = Boolean(user.email && (user.email_confirmed_at || user.confirmed_at));
  return provider === 'google' && hasGoogleIdentity && emailIsVerified;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only the login screen, OAuth callback and framework assets are public.
  if (
    pathname === '/auth/login' ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Fail closed if Supabase public client configuration is missing.
  if (!supabaseUrl || !supabaseAnonKey || !authCookieName) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
    }
    return NextResponse.redirect(new URL('/auth/login?error=config', request.url));
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

  // Reject sessions authenticated through another provider or without a verified email.
  if (!isVerifiedGoogleUser(data.user)) {
    await supabase.auth.signOut();
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Akses ditolak. Gunakan akun Google dengan email terverifikasi.' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/auth/login?error=google_verification', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
