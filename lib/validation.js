/**
 * Service-request form validation (client-side).
 * Pure JS, no dependencies — same rules are enforced server-side in the API route.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES = [
  { field: 'name', test: (v) => v.trim().length >= 2, message: 'Please enter your full name.' },
  { field: 'phone', test: (v) => v.trim().length >= 5, message: 'Please enter a contact phone number.' },
  { field: 'email', test: (v) => v.trim() === '' || EMAIL_RE.test(v.trim()), message: 'Please enter a valid email address.' },
  { field: 'car_make_model', test: (v) => v.trim().length > 0, message: 'Please tell us the car make and model.' },
  { field: 'service_needed', test: (v) => v.trim().length > 0, message: 'Please choose a service.' },
];

export function validateServiceRequest(form) {
  const errors = {};
  for (const { field, test, message } of RULES) {
    const value = form[field] ?? '';
    if (!test(value)) errors[field] = message;
  }
  return errors;
}

export function isValid(errors) {
  return Object.keys(errors).length === 0;
}
