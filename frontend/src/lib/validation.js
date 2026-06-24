/**
 * Service-request form validation.
 * Extracted from the form component to keep the component focused on rendering
 * and to make validation rules independently unit-testable.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES = [
  {
    field: 'name',
    test: (v) => v.trim().length >= 2,
    message: 'Please enter your full name.',
  },
  {
    field: 'phone',
    test: (v) => v.trim().length >= 5,
    message: 'Please enter a contact phone number.',
  },
  {
    field: 'email',
    test: (v) => v.trim() === '' || EMAIL_RE.test(v.trim()),
    message: 'Please enter a valid email address.',
  },
  {
    field: 'car_make_model',
    test: (v) => v.trim().length > 0,
    message: 'Please tell us the car make and model.',
  },
  {
    field: 'service_needed',
    test: (v) => v.trim().length > 0,
    message: 'Please choose a service.',
  },
];

/**
 * Validate the service request form.
 * @param {Record<string,string>} form
 * @returns {Record<string,string>} error map keyed by field
 */
export function validateServiceRequest(form) {
  const errors = {};
  for (const { field, test, message } of RULES) {
    const value = form[field] ?? '';
    if (!test(value)) errors[field] = message;
  }
  return errors;
}

/** True when no validation errors are present. */
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}
