import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locales = ['en', 'pt', 'es'];
  const segments = pathname.split('/');
  const urlLang = segments[1];

  // 1. URL already has a locale
  if (locales.includes(urlLang)) {
    // Correctly rewrite internally to the base path
    const newPathname = '/' + segments.slice(2).join('/');
    const url = request.nextUrl.clone();
    url.pathname = newPathname || '/';
    url.searchParams.set('lang', urlLang);
    
    const response = NextResponse.rewrite(url);
    // Ensure cookie is in sync with URL
    response.cookies.set('lang', urlLang, { path: '/', maxAge: 31536000 });
    return response;
  }

  // 2. URL does NOT have a locale. Check cookie.
  const langCookie = request.cookies.get('lang')?.value;
  if (langCookie && locales.includes(langCookie) && langCookie !== 'es') {
    // Redirect to the localized version to keep URL consistency
    const url = request.nextUrl.clone();
    url.pathname = `/${langCookie}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};
