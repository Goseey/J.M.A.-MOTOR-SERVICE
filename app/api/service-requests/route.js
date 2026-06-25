import { NextResponse } from 'next/server';
import { isDbConfigured, insertServiceRequest, markEmailSent, sql } from '@/lib/db';

// Node.js runtime is required for the Neon driver and the optional Resend SDK.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LANGS = new Set(['en', 'so']);

function validate(body) {
  const errs = {};
  const must = (k, ok, msg) => { if (!ok) errs[k] = msg; };

  must('name', typeof body?.name === 'string' && body.name.trim().length >= 2,
       'Please enter your full name.');
  must('phone', typeof body?.phone === 'string' && body.phone.trim().length >= 5,
       'Please enter a contact phone number.');
  if (body?.email) {
    must('email', typeof body.email === 'string' && EMAIL_RE.test(body.email.trim()),
         'Please enter a valid email address.');
  }
  must('car_make_model', typeof body?.car_make_model === 'string' && body.car_make_model.trim().length > 0,
       'Please tell us the car make and model.');
  must('service_needed', typeof body?.service_needed === 'string' && body.service_needed.trim().length > 0,
       'Please choose a service.');
  return errs;
}

async function sendEmail(doc) {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const rows = [
      ['Request ID', doc.id],
      ['Name', doc.customer_name],
      ['Phone', doc.phone],
      ['Email', doc.email || '—'],
      ['Car (make & model)', doc.car_make_model],
      ['Service needed', doc.service_needed],
      ['Preferred date', doc.preferred_date || '—'],
      ['Language', doc.selected_language === 'so' ? 'Af-Soomaali' : 'English'],
      ['Message', (doc.message || '—').replace(/\n/g, '<br/>')],
    ];
    const bodyRows = rows
      .map(([k, v]) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font:13px Arial,sans-serif;width:180px;vertical-align:top;">${k}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font:14px Arial,sans-serif;">${v}</td>
      </tr>`)
      .join('');

    const html = `<div style="background:#050505;padding:32px 0;font-family:Arial,sans-serif;">
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

    const params = {
      from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
      to: [process.env.BUSINESS_EMAIL || 'info@jmamotorservice.ie'],
      subject: `New service request — ${doc.customer_name} (${doc.car_make_model})`,
      html,
    };
    if (doc.email) params.reply_to = doc.email;

    await resend.emails.send(params);
    return true;
  } catch (e) {
    console.warn('[service-requests] Email send failed (request still succeeded):', e?.message || e);
    return false;
  }
}

export async function POST(request) {
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

  const email_sent = await sendEmail(saved);
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

export async function GET() {
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
