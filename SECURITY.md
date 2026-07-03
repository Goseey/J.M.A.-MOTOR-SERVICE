# Security Policy

## Reporting a Vulnerability

If you find a security issue in this project, please email
**info@jmamotorservice.ie** with a description and reproduction steps.
Please do not open a public GitHub issue for security reports.

## Security measures in this codebase

- Admin auth: bcrypt password hashes in `admin_users`, HMAC-SHA256 signed
  session cookies (httpOnly, secure, SameSite=Lax) with a 12-hour lifetime
  enforced server-side.
- Login brute-force protection: 10 failed attempts from one IP trigger a
  1 minute block, doubling on each repeat offence up to 1 hour.
- The public booking API is rate limited (5 submissions / 10 min / IP).
- All SQL uses parameterized tagged-template queries (no string concatenation).
- All user-supplied values are HTML-escaped before being embedded in emails.
- Security headers (X-Frame-Options, nosniff, Referrer-Policy) are set globally.
- `/admin` is protected both by middleware and by per-page/per-action session
  checks (defense in depth).
