import { compare as verifyHash, hash as hashPassword } from 'bcryptjs';
import { findAdminUserByEmail } from '@/lib/admin';

// Lazily-built throwaway hash used only to equalize response time when the
// email does not exist, so an attacker cannot enumerate valid admin emails by
// measuring how long a login attempt takes.
let dummyHashPromise = null;
function getDummyHash() {
  if (!dummyHashPromise) dummyHashPromise = hashPassword('unused-timing-equalizer', 12);
  return dummyHashPromise;
}

export async function authenticateAdminUser(email, password) {
  if (!email || !password) return null;
  const admin = await findAdminUserByEmail(email);
  if (!admin?.password_hash) {
    try { await verifyHash(password, await getDummyHash()); } catch { /* ignore */ }
    return null;
  }
  const ok = await verifyHash(password, admin.password_hash);
  return ok ? admin : null;
}
