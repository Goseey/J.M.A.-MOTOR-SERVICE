/**
 * Create (or update the password of) an admin user.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/create-admin.mjs admin@example.com 'StrongPassword123'
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const [email, password] = process.argv.slice(2);

if (!process.env.DATABASE_URL || !email || !password) {
  console.error('Usage: DATABASE_URL=... node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters long.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = bcrypt.hashSync(password, 12);

await sql`
  INSERT INTO admin_users (email, password_hash, is_active)
  VALUES (${email.toLowerCase()}, ${passwordHash}, TRUE)
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE
`;

console.log(`Admin user ready: ${email.toLowerCase()}`);
