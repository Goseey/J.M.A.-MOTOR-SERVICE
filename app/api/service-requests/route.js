import { NextResponse } from 'next/server';
import { isDbConfigured, insertServiceRequest, markEmailSent, sql } from '@/lib/db';
import { checkApiRateLimit, getClientIp } from '@/lib/rate-limit';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from '@/lib/admin-auth';

// Public booking endpoint: at most 5 submissions per IP per 10 minutes.
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_SECONDS = 10 * 60;

// Node.js runtime is required for the Neon driver and the optional Resend SDK.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LANGS = new Set(['en', 'so']);

function isValidPreferredDate(value) {
  if (!value) return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) return false;
  if (date.getDay() === 0) return false;
  return true;
}

function validate(body) {
  const errs = {};
  const must = (k, ok, msg) => { if (!ok) errs[k] = msg; };

  must('name', typeof body?.name === 'string' && body.name.trim().length >= 2,
       'Please enter your full name.');
  must('phone', typeof body?.phone === 'string' && body.phone.trim().length >= 5,
       'Please enter a contact phone number.');
  must('email', typeof body?.email === 'string' && EMAIL_RE.test(body.email.trim()),
       'Please enter a valid email address.');
  must('car_make_model', typeof body?.car_make_model === 'string' && body.car_make_model.trim().length > 0,
       'Please tell us the car make and model.');
  must('service_needed', typeof body?.service_needed === 'string' && body.service_needed.trim().length > 0,
       'Please choose a service.');
  must('preferred_date', isValidPreferredDate(body?.preferred_date),
       'Please choose a future date that is not Sunday.');
  return errs;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function getCustomerEmailCopy(doc) {
  const isSomali = doc.selected_language === 'so';

  if (isSomali) {
    return {
      subject: 'J.M.A. Motor Service — waxaan helnay codsigaaga',
      heading: 'Waxaan helnay codsigaaga adeegga',
      intro: 'Waad ku mahadsan tahay la xiriirka J.M.A. Motor Service. Waxaan helnay codsigaaga waxaanan kuugu soo diri doonaa xaqiijin iimaylkan.',
      summaryTitle: 'Faahfaahinta codsigaaga',
      nextTitle: 'Maxaa xiga?',
      nextText: 'Kooxdayadu waxay dib u eegi doontaa codsigaaga waxayna kula soo xiriiri doontaa si ay u xaqiijiyaan helitaanka iyo tallaabada xigta. Ballanta si toos ah looma xaqiijin marka foomka la diro.',
      footer: 'Haddii arrintu degdeg tahay, fadlan si toos ah noogu soo wac.',
      labels: {
        requestId: 'Aqoonsiga codsiga',
        name: 'Magac',
        phone: 'Telefoon',
        email: 'Iimayl',
        car: 'Baabuur',
        service: 'Adeeg',
        preferredDate: 'Taariikhda la rabo',
        message: 'Fariin',
      },
    };
  }

  return {
    subject: 'J.M.A. Motor Service — we received your request',
    heading: 'We received your service request',
    intro: 'Thanks for contacting J.M.A. Motor Service. We have received your request and will send confirmation to this email address.',
    summaryTitle: 'Your request details',
    nextTitle: 'What happens next?',
    nextText: 'Our team will review your request and contact you to confirm availability and the next step. Your booking is not confirmed automatically when the form is submitted.',
    footer: 'If your issue is urgent, please call us directly.',
    labels: {
      requestId: 'Request ID',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      car: 'Car',
      service: 'Service',
      preferredDate: 'Preferred date',
      message: 'Message',
    },
  };
}

function makeAdminEmailHtml(doc) {
  // Every user-controlled value is escaped — form fields must never be able to
  // inject HTML into the emails we send.
  const rows = [
    ['Request ID', escapeHtml(doc.id)],
    ['Name', escapeHtml(doc.customer_name)],
    ['Phone', escapeHtml(doc.phone)],
    ['Email', escapeHtml(doc.email)],
    ['Car (make & model)', escapeHtml(doc.car_make_model)],
    ['Service needed', escapeHtml(doc.service_needed)],
    ['Preferred date', escapeHtml(formatDate(doc.preferred_date))],
    ['Language', doc.selected_language === 'so' ? 'Af-Soomaali' : 'English'],
    ['Message', doc.message ? escapeHtml(doc.message).replace(/\n/g, '<br/>') : '—'],
  ];

  const bodyRows = rows
    .map(([k, v]) => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font:13px Arial,sans-serif;width:180px;vertical-align:top;">${escapeHtml(k)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font:14px Arial,sans-serif;">${v || '—'}</td>
    </tr>`)
    .join('');

  return `<div style="background:#050505;padding:32px 0;font-family:Arial,sans-serif;">
    <table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" style="background:#121212;border:1px solid #2a2a2a;border-radius:4px;">
      <tr><td style="padding:24px 24px 0 24px;">
        <div style="color:#D4AF37;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;">J.M.A. Motor Service</div>
        <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px 0;">New service request</h1>
        <p style="color:#a3a3a3;font-size:13px;margin:0 0 16px 0;">A new customer has submitted a service request through the website.</p>
      </td></tr>
      <tr><td style="padding:0 12px 24px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #2a2a2a;">${bodyRows}</table>
        <p style="color:#666;font-size:11px;margin-top:16px;text-align:center;">Sent automatically from jmamotorservice.ie</p>
      </td></tr>
    </table>
  </div>`;
}

function makeCustomerEmailHtml(doc) {
  const copy = getCustomerEmailCopy(doc);
  const rows = [
    [copy.labels.requestId, escapeHtml(doc.id)],
    [copy.labels.name, escapeHtml(doc.customer_name)],
    [copy.labels.phone, escapeHtml(doc.phone)],
    [copy.labels.email, escapeHtml(doc.email)],
    [copy.labels.car, escapeHtml(doc.car_make_model)],
    [copy.labels.service, escapeHtml(doc.service_needed)],
    [copy.labels.preferredDate, escapeHtml(formatDate(doc.preferred_date))],
    [copy.labels.message, doc.message ? escapeHtml(doc.message).replace(/\n/g, '<br/>') : '—'],
  ];

  const bodyRows = rows
    .map(([k, v]) => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font:13px Arial,sans-serif;width:180px;vertical-align:top;">${escapeHtml(k)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font:14px Arial,sans-serif;">${v || '—'}</td>
    </tr>`)
    .join('');

  return {
    subject: copy.subject,
    html: `<div style="background:#050505;padding:32px 0;font-family:Arial,sans-serif;">
      <table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" style="background:#121212;border:1px solid #2a2a2a;border-radius:4px;">
        <tr><td style="padding:24px 24px 0 24px;">
          <div style="color:#D4AF37;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;">J.M.A. Motor Service</div>
          <h1 style="color:#ffffff;font-size:22px;margin:8px 0 6px 0;">${escapeHtml(copy.heading)}</h1>
          <p style="color:#a3a3a3;font-size:14px;line-height:1.6;margin:0 0 18px 0;">${escapeHtml(copy.intro)}</p>
        </td></tr>
        <tr><td style="padding:0 12px 0 12px;">
          <div style="padding:0 12px 12px 12px;color:#D4AF37;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(copy.summaryTitle)}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #2a2a2a;">${bodyRows}</table>
        </td></tr>
        <tr><td style="padding:22px 24px 24px 24px;">
          <div style="color:#ffffff;font-size:14px;font-weight:700;margin-bottom:8px;">${escapeHtml(copy.nextTitle)}</div>
          <p style="color:#a3a3a3;font-size:14px;line-height:1.65;margin:0 0 12px 0;">${escapeHtml(copy.nextText)}</p>
          <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0;">${escapeHtml(copy.footer)}</p>
        </td></tr>
      </table>
    </div>`,
  };
}

async function sendEmails(doc) {
  // Email delivery is intentionally best-effort: the booking itself should still
  // succeed even if Resend is unavailable or misconfigured.
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
    const businessInbox = process.env.BUSINESS_EMAIL || 'info@jmamotorservice.ie';
    const customerEmail = doc.email?.trim();
    const customerMail = makeCustomerEmailHtml(doc);

    const sends = [
      resend.emails.send({
        from,
        to: [businessInbox],
        subject: `New service request — ${doc.customer_name} (${doc.car_make_model})`,
        html: makeAdminEmailHtml(doc),
        replyTo: customerEmail || undefined,
      }),
    ];

    if (customerEmail) {
      sends.push(
        resend.emails.send({
          from,
          to: [customerEmail],
          subject: customerMail.subject,
          html: customerMail.html,
          replyTo: businessInbox,
        }),
      );
    }

    await Promise.all(sends);
    return true;
  } catch (e) {
    console.warn('[service-requests] Email send failed (request still succeeded):', e?.message || e);
    return false;
  }
}

export async function POST(request) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkApiRateLimit('service-request', ip, SUBMIT_LIMIT, SUBMIT_WINDOW_SECONDS);
  if (!allowed) {
    return NextResponse.json(
      { detail: 'Too many requests. Please try again in a few minutes or call us directly.' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON body.' }, { status: 400 });
  }

  const errors = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ detail: 'Validation failed.', errors }, { status: 422 });
  }

  const selected_language = VALID_LANGS.has(body.selected_language)
    ? body.selected_language
    : 'en';

  const payload = {
    customer_name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email?.trim() || null,
    car_make_model: body.car_make_model.trim(),
    service_needed: body.service_needed.trim(),
    preferred_date: body.preferred_date || null,
    message: body.message?.trim() || null,
    selected_language,
  };

  let saved;
  if (isDbConfigured()) {
    try {
      saved = await insertServiceRequest(payload);
    } catch (e) {
      console.error('[service-requests] DB insert failed:', e?.message || e);
      return NextResponse.json(
        { detail: 'Could not save your request. Please call us directly.' },
        { status: 500 },
      );
    }
  } else {
    // Graceful fallback for preview / first deploys with no database yet.
    saved = {
      id: 'local-' + Date.now().toString(36),
      ...payload,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log('[service-requests] Submission (DB not configured, log-only):', {
      id: saved.id, name: saved.customer_name, phone: saved.phone, lang: saved.selected_language,
    });
  }

  const email_sent = await sendEmails(saved);
  if (email_sent && isDbConfigured()) {
    await markEmailSent(saved.id);
  }

  return NextResponse.json(
    {
      id: saved.id,
      name: saved.customer_name,
      phone: saved.phone,
      email: saved.email,
      car_make_model: saved.car_make_model,
      service_needed: saved.service_needed,
      preferred_date: saved.preferred_date,
      message: saved.message,
      selected_language: saved.selected_language,
      status: saved.status || 'new',
      email_sent,
      created_at: saved.created_at,
    },
    { status: 201 },
  );
}

export async function GET(request) {
  // Public health check: no configuration details for anonymous callers.
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAdmin = await verifyAdminSessionValue(session);

  if (!isAdmin) {
    return NextResponse.json({ status: 'ok', service: 'jma-motor-service' });
  }

  let db_reachable = false;
  if (isDbConfigured()) {
    try {
      await sql`SELECT 1`;
      db_reachable = true;
    } catch {
      db_reachable = false;
    }
  }

  return NextResponse.json({
    status: 'ok',
    service: 'jma-motor-service',
    db_configured: isDbConfigured(),
    db_reachable,
    email_configured: Boolean(process.env.RESEND_API_KEY),
    time: new Date().toISOString(),
  });
}
