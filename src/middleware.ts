import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locales = ['en', 'pt', 'es'];
  const segments = pathname.split('/');
  const urlLang = segments[1];

  // 1. If URL has a locale prefix
  if (locales.includes(urlLang)) {
    const newPathname = '/' + segments.slice(2).join('/');
    const url = request.nextUrl.clone();
    url.pathname = newPathname || '/';
    
    const response = NextResponse.rewrite(url);
    // Sync cookie
    response.cookies.set('lang', urlLang, { path: '/', maxAge: 31536000 });
    return response;
  }

  // 2. If no locale, but we have a cookie, we rewrite INTERNALLY (invisible to user)
  const cookieLang = request.cookies.get('lang')?.value;
  if (cookieLang && locales.includes(cookieLang) && cookieLang !== 'es') {
    const url = request.nextUrl.clone();
    // We don't redirect, just rewrite so the server knows the lang
    // The client will also see the cookie
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};
