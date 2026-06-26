import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSessionCookieOptions } from '@/lib/admin-auth';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
