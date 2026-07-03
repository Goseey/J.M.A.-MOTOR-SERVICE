/**
 * Database-backed rate limiting (works across serverless instances).
 *
 * Two mechanisms:
 *
 * 1. Login brute-force protection (escalating blocks):
 *    - After LOGIN_MAX_FAILURES failed attempts from one IP the IP is blocked
 *      for LOGIN_BASE_BLOCK_MINUTES.
 *    - Every subsequent block doubles the duration (1 → 2 → 4 → 8 → 16 → 32 → 60 min),
 *      capped at LOGIN_MAX_BLOCK_MINUTES.
 *    - A successful login clears the counter for that IP.
 *    - If an IP behaves for LOGIN_LEVEL_RESET_HOURS, its escalation level resets.
 *
 * 2. Simple sliding-window limit for the public booking API.
 *
 * All checks FAIL OPEN: if the database is unavailable we allow the request and
 * log the error — availability of the booking flow matters more than a limiter.
 */

import { isDbConfigured, sql } from '@/lib/db';

const LOGIN_MAX_FAILURES = 10; // failed attempts before a block kicks in
const LOGIN_BASE_BLOCK_MINUTES = 1; // first block duration
const LOGIN_MAX_BLOCK_MINUTES = 60; // cap for escalating blocks
const LOGIN_LEVEL_RESET_HOURS = 24; // quiet period after which escalation resets

/** Extract the client IP from a Headers-like object (Vercel sets x-forwarded-for). */
export function getClientIp(headersList) {
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headersList.get('x-real-ip');
  if (real) return real.trim().slice(0, 64);
  return 'unknown';
}

function blockMinutesForLevel(level) {
  const minutes = LOGIN_BASE_BLOCK_MINUTES * 2 ** Math.max(0, level - 1);
  return Math.min(LOGIN_MAX_BLOCK_MINUTES, minutes);
}

/** Is this IP currently blocked from attempting a login? */
export async function checkLoginAllowed(ip) {
  if (!isDbConfigured() || !ip) return { allowed: true, retryAfterSeconds: 0 };
  try {
    const rows = await sql`
      SELECT blocked_until
      FROM login_throttle
      WHERE ip = ${ip}
        AND blocked_until IS NOT NULL
        AND blocked_until > NOW()
      LIMIT 1
    `;
    if (rows.length === 0) return { allowed: true, retryAfterSeconds: 0 };
    const blockedUntil = new Date(rows[0].blocked_until).getTime();
    const retryAfterSeconds = Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000));
    return { allowed: false, retryAfterSeconds };
  } catch (error) {
    console.error('[rate-limit] login check failed (fail-open):', error?.message || error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Record a failed login attempt.
 * Returns { blocked, retryAfterSeconds } describing whether this failure
 * pushed the IP over the limit and started a block.
 */
export async function registerLoginFailure(ip) {
  if (!isDbConfigured() || !ip) return { blocked: false, retryAfterSeconds: 0 };
  try {
    const rows = await sql`
      SELECT fail_count, block_level, blocked_until, updated_at
      FROM login_throttle
      WHERE ip = ${ip}
      LIMIT 1
    `;

    let failCount = 0;
    let blockLevel = 0;

    if (rows.length > 0) {
      const row = rows[0];
      const quietMs = Date.now() - new Date(row.updated_at).getTime();
      const levelExpired = quietMs > LOGIN_LEVEL_RESET_HOURS * 60 * 60 * 1000;
      failCount = levelExpired ? 0 : row.fail_count;
      blockLevel = levelExpired ? 0 : row.block_level;
    }

    failCount += 1;

    let blockedUntil = null;
    let retryAfterSeconds = 0;

    if (failCount >= LOGIN_MAX_FAILURES) {
      blockLevel += 1;
      const minutes = blockMinutesForLevel(blockLevel);
      retryAfterSeconds = minutes * 60;
      blockedUntil = new Date(Date.now() + retryAfterSeconds);
      failCount = 0; // counter restarts after the block expires
    }

    await sql`
      INSERT INTO login_throttle (ip, fail_count, block_level, blocked_until, updated_at)
      VALUES (${ip}, ${failCount}, ${blockLevel}, ${blockedUntil}, NOW())
      ON CONFLICT (ip) DO UPDATE SET
        fail_count = EXCLUDED.fail_count,
        block_level = EXCLUDED.block_level,
        blocked_until = EXCLUDED.blocked_until,
        updated_at = NOW()
    `;

    return { blocked: Boolean(blockedUntil), retryAfterSeconds };
  } catch (error) {
    console.error('[rate-limit] failed to register login failure:', error?.message || error);
    return { blocked: false, retryAfterSeconds: 0 };
  }
}

/** Clear the failure counter after a successful login. */
export async function registerLoginSuccess(ip) {
  if (!isDbConfigured() || !ip) return;
  try {
    await sql`DELETE FROM login_throttle WHERE ip = ${ip}`;
  } catch (error) {
    console.error('[rate-limit] failed to clear login throttle:', error?.message || error);
  }
}

/**
 * Sliding-window rate limit for public endpoints.
 * Allows at most `limit` events per `windowSeconds` per (scope, ip).
 */
export async function checkApiRateLimit(scope, ip, limit, windowSeconds) {
  if (!isDbConfigured() || !ip) return { allowed: true };
  try {
    // Opportunistic cleanup so the table never grows unbounded.
    if (Math.random() < 0.05) {
      await sql`DELETE FROM rate_limit_events WHERE created_at < NOW() - INTERVAL '1 day'`;
    }

    const rows = await sql`
      SELECT COUNT(*)::int AS hits
      FROM rate_limit_events
      WHERE scope = ${scope}
        AND ip = ${ip}
        AND created_at > NOW() - make_interval(secs => ${windowSeconds})
    `;

    if ((rows[0]?.hits ?? 0) >= limit) return { allowed: false };

    await sql`INSERT INTO rate_limit_events (scope, ip) VALUES (${scope}, ${ip})`;
    return { allowed: true };
  } catch (error) {
    console.error('[rate-limit] api check failed (fail-open):', error?.message || error);
    return { allowed: true };
  }
}
