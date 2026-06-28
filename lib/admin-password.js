import { compare as verifyHash } from 'bcryptjs';
import { findAdminUserByEmail } from '@/lib/admin';

export async function authenticateAdminUser(email, password) {
  if (!email || !password) return null;
  const admin = await findAdminUserByEmail(email);
  if (!admin?.password_hash) return null;
  const ok = await verifyHash(password, admin.password_hash);
  return ok ? admin : null;
}
