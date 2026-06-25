import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

// Node.js runtime required for the Neon / Resend SDKs.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

let cachedSql = null;

async function getSql() {
  if (!process.env.DATABASE_URL) return null;
  try {
    if (!cachedSql) {
      const { neon } = await import('@neondatabase/serverless');
      cachedSql = neon(process.env.DATABASE_URL);
    }
    return cachedSql;
  } catch (e) {
    console.warn('[service-requests] Neon unavailable, falling back to log-only:', e?.message || e);
    return null;
  }
}

async function saveRequest(doc) {
  const sql = await getSql();
  if (!sql) return false;

  try {
    await sql`
      insert into service_requests (
        request_id,
        name,
        phone,
        email,
        car_make_model,
        service_needed,
        preferred_date,
        message,
        email_sent,
        source,
        created_at
      ) values (
        ${doc.id}::uuid,
        ${doc.name},
        ${doc.phone},
        ${doc.email},
        ${doc.car_make_model},
        ${doc.service_needed},
        ${doc.preferred_date},
        ${doc.message},
        ${doc.email_sent},
        ${doc.source},
        ${doc.created_at}::timestamptz
      )
    `;
    return true;
  } catch (e) {
    console.warn('[service-requests] Insert failed (request still succeeded):', e?.message || e);
    return false;
  }
}

async function markEmailSent(id) {
  const sql = await getSql();
  if (!sql) return;

  try {
    await sql`
      update service_requests
      set email_sent = true
      where request_id = ${id}::uuid
    `;
  } catch (e) {
    console.warn('[service-requests] Email flag update failed:', e?.message || e);
  }
}

async function sendEmail(doc) {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const rows = [
      ['Request ID', doc.id],
      ['Name', doc.name],
      ['Phone', doc.phone],
      ['Email', doc.email || '—'],
      ['Car (make & model)', doc.car_make_model],
      ['Service needed', doc.service_needed],
      ['Preferred date', doc.preferred_date || '—'],
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
      subject: `New service request — ${doc.name} (${doc.car_make_model})`,
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
    return NextResponse.json(
      { detail: 'Validation failed.', errors },
      { status: 422 },
    );
  }

  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  const doc = {
    id,
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email?.trim() || null,
    car_make_model: body.car_make_model.trim(),
    service_needed: body.service_needed.trim(),
    preferred_date: body.preferred_date || null,
    message: body.message?.trim() || null,
    email_sent: false,
    created_at,
    source: 'website',
  };

  const saved = await saveRequest(doc);
  if (!saved) {
    console.log('[service-requests] Submission (DB not configured or unavailable):', {
      id, name: doc.name, phone: doc.phone, car: doc.car_make_model, service: doc.service_needed,
    });
  }

  doc.email_sent = await sendEmail(doc);
  if (saved && doc.email_sent) {
    await markEmailSent(id);
  }

  return NextResponse.json(
    {
      id,
      name: doc.name,
      phone: doc.phone,
      email: doc.email,
      car_make_model: doc.car_make_model,
      service_needed: doc.service_needed,
      preferred_date: doc.preferred_date,
      message: doc.message,
      email_sent: doc.email_sent,
      created_at,
    },
    { status: 201 },
  );
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'jma-motor-service',
    db_configured: Boolean(process.env.DATABASE_URL),
    email_configured: Boolean(process.env.RESEND_API_KEY),
    time: new Date().toISOString(),
  });
}
