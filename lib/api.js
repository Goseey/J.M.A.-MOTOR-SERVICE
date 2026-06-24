/**
 * Service-request API client.
 * Same-origin call to the Next.js API route — no CORS, no env-var-driven base URL.
 */
export async function submitServiceRequest(payload) {
  const res = await fetch('/api/service-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = 'Submission failed. Please call us directly.';
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      /* ignore JSON parse errors */
    }
    const err = new Error(detail);
    err.response = { data: { detail }, status: res.status };
    throw err;
  }

  return res.json();
}
