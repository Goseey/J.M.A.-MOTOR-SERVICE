const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = 'jma_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || '';
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && getSecret());
}

function toBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

async function importKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function sign(value) {
  const key = await importKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Buffer.from(signature).toString('hex');
}

function timingSafeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createAdminSessionValue() {
  const payload = JSON.stringify({
    ts: Date.now(),
    nonce: toBase64Url(String(Date.now()) + Math.random().toString(36).slice(2)),
  });
  const encoded = toBase64Url(payload);
  const signature = await sign(encoded);
  return `${encoded}.${signature}`;
}

export async function verifyAdminSessionValue(value) {
  if (!value || typeof value !== 'string' || !getSecret()) return false;

  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return false;

  const expected = await sign(encoded);
  if (!timingSafeEqualHex(signature, expected)) return false;

  try {
    const decoded = JSON.parse(fromBase64Url(encoded));
    return typeof decoded?.ts === 'number';
  } catch {
    return false;
  }
}

export function isValidAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || typeof password !== 'string' || password.length !== expected.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}
