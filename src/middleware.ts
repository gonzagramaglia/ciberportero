import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Auth Protection for /admin
  if (pathname.startsWith('/admin')) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL('/api/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const locales = ['en', 'pt', 'es'];
  const segments = pathname.split('/');
  const urlLang = segments[1];

  // 2. Locale rewriting logic...
  if (locales.includes(urlLang)) {
    const newPathname = '/' + segments.slice(2).join('/');
    const url = request.nextUrl.clone();
    url.pathname = newPathname || '/';
    
    const response = NextResponse.rewrite(url);
    response.cookies.set('lang', urlLang, { path: '/', maxAge: 31536000 });
    return response;
  }

  const cookieLang = request.cookies.get('lang')?.value;
  if (cookieLang && locales.includes(cookieLang) && cookieLang !== 'es') {
    const url = request.nextUrl.clone();
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};
