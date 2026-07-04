import Link from 'next/link';
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { makeT } from '@/lib/i18n';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  getAdminSessionCookieOptions,
  isAdminAuthConfigured,
  verifyAdminSessionValue,
} from '@/lib/admin-auth';
import { authenticateAdminUser } from '@/lib/admin-password';
import {
  checkLoginAllowed,
  getClientIp,
  registerLoginFailure,
  registerLoginSuccess,
} from '@/lib/rate-limit';
import { isDbConfigured } from '@/lib/db';
import AdminLoginSubmit from '@/components/AdminLoginSubmit';

export const metadata = {
  title: 'Admin Login | J.M.A. Motor Service',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const lang = params?.lang === 'so' ? 'so' : 'en';
  const t = makeT(lang);
  const nextPath = typeof params?.next === 'string' && params.next.startsWith('/admin')
    ? params.next
    : '/admin';

  const cookieStore = await cookies();
  const existing = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifyAdminSessionValue(existing)) {
    redirect(nextPath);
  }

  const authReady = isAdminAuthConfigured() && isDbConfigured();

  return (
    <div className="min-h-screen bg-ink-950 text-white app-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grain opacity-80" />
        <div className="absolute top-0 left-0 w-40 h-40 border-t border-l border-gold-400/15" />
        <div className="absolute bottom-0 right-0 w-40 h-40 border-b border-r border-gold-400/15" />
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-5 py-16 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 px-3 h-10 rounded-sm border border-white/10 bg-ink-900/80 text-white/75 hover:text-white hover:border-white/20 hover:bg-ink-800 transition-colors"
            data-testid="admin-login-back-home"
          >
            <ArrowLeft className="h-4 w-4 text-gold-300" strokeWidth={2} />
            <span className="text-[13px] font-semibold tracking-wide">{t('admin.login.backHome')}</span>
          </Link>

          <div className="border border-white/10 bg-ink-900/95 backdrop-blur-xl rounded-sm shadow-ring p-7 sm:p-9">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center h-11 w-11 rounded-sm border border-gold-400/25 bg-gold-400/10 text-gold-300">
                <LockKeyhole className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest2 text-gold-300">{t('admin.login.overline')}</div>
                <h1 className="font-display text-2xl font-bold text-white mt-1">{t('admin.login.headline')}</h1>
              </div>
            </div>

            <p className="text-white/60 leading-relaxed mb-7">
              {t('admin.login.description')}
            </p>

            {!authReady ? (
              <div className="flex items-start gap-3 rounded-sm border border-amber-400/20 bg-amber-400/10 text-amber-100 p-4" data-testid="admin-login-config-warning">
                <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-amber-300" strokeWidth={1.8} />
                <div>
                  <p className="font-semibold">{t('admin.login.notConfiguredTitle')}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-100/85">{t('admin.login.notConfiguredText')}</p>
                </div>
              </div>
            ) : (
              <form action={loginAction} className="space-y-5" data-testid="admin-login-form">
                <input type="hidden" name="next" value={nextPath} />
                <input type="hidden" name="lang" value={lang} />

                <label className="block">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-widest2 text-white/55 font-medium">
                      {t('admin.login.emailLabel')}
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="w-full bg-ink-800 text-white placeholder-white/30 border border-white/10 hover:border-white/20 rounded-sm h-12 px-4 text-[14.5px] transition-colors focus-gold"
                    placeholder={t('admin.login.emailPlaceholder')}
                    data-testid="admin-login-email"
                    required
                  />
                </label>

                <label className="block">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-widest2 text-white/55 font-medium">
                      {t('admin.login.passwordLabel')}
                    </span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    className="w-full bg-ink-800 text-white placeholder-white/30 border border-white/10 hover:border-white/20 rounded-sm h-12 px-4 text-[14.5px] transition-colors focus-gold"
                    placeholder={t('admin.login.passwordPlaceholder')}
                    data-testid="admin-login-password"
                    required
                  />
                </label>

                {params?.error === '1' ? (
                  <div className="rounded-sm border border-red-500/35 bg-red-500/10 text-red-200 px-4 py-3 text-sm" data-testid="admin-login-error">
                    {t('admin.login.invalidCredentials')}
                  </div>
                ) : null}

                {params?.error === '2' ? (
                  <div className="rounded-sm border border-red-500/35 bg-red-500/10 text-red-200 px-4 py-3 text-sm" data-testid="admin-login-rate-limited">
                    {t('admin.login.tooManyAttempts').replace(
                      '{minutes}',
                      String(Math.max(1, Math.ceil((Number.parseInt(params?.wait, 10) || 60) / 60))),
                    )}
                  </div>
                ) : null}

                <AdminLoginSubmit
                  initialWait={params?.error === '2' ? (Number.parseInt(params?.wait, 10) || 60) : 0}
                  submitLabel={t('admin.login.submit')}
                  lockedTemplate={t('admin.login.lockedCountdown')}
                />
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

async function loginAction(formData) {
  'use server';

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const lang = String(formData.get('lang') || 'en') === 'so' ? 'so' : 'en';
  const nextPath = String(formData.get('next') || '/admin').startsWith('/admin')
    ? String(formData.get('next') || '/admin')
    : '/admin';

  if (!isAdminAuthConfigured() || !isDbConfigured()) {
    redirect(`/admin/login?error=1&lang=${lang}&next=${encodeURIComponent(nextPath)}`);
  }

  // Brute-force protection: after 10 failed attempts an IP is blocked for
  // 1 minute; each following block doubles (2, 4, 8, ... capped at 60 min).
  const ip = getClientIp(await headers());
  const { allowed, retryAfterSeconds } = await checkLoginAllowed(ip);
  if (!allowed) {
    redirect(`/admin/login?error=2&wait=${retryAfterSeconds}&lang=${lang}&next=${encodeURIComponent(nextPath)}`);
  }

  const admin = await authenticateAdminUser(email, password);
  if (!admin) {
    const failure = await registerLoginFailure(ip);
    if (failure.blocked) {
      redirect(`/admin/login?error=2&wait=${failure.retryAfterSeconds}&lang=${lang}&next=${encodeURIComponent(nextPath)}`);
    }
    redirect(`/admin/login?error=1&lang=${lang}&next=${encodeURIComponent(nextPath)}`);
  }

  await registerLoginSuccess(ip);

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSessionValue(admin),
    getAdminSessionCookieOptions(),
  );

  redirect(nextPath);
}
