import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from '@/lib/admin-auth';

export async function middleware(request) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (
    request.nextUrl.pathname.startsWith('/admin/login') ||
    request.nextUrl.pathname.startsWith('/admin/logout')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifyAdminSessionValue(session)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
