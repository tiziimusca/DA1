const NAME_INVALID_PATTERN = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/;
const EMAIL_LOCAL_PATTERN = /^[a-z0-9._%+-]+$/;
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'yahoo.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'gmail.com.ar',
  'hotmail.com.ar',
  'yahoo.com.ar',
  'outlook.com.ar',
  'hotmail.es',
  'gmail.es',
  'yahoo.es',
  'outlook.es',
];

export function isValidName(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 && !NAME_INVALID_PATTERN.test(trimmed);
}

export function isValidEmail(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return false;
  }
  const [local, domain] = parts;
  if (!local || !domain || !EMAIL_LOCAL_PATTERN.test(local)) {
    return false;
  }
  const normalizedDomain = domain.replace(/^www\./, '');
  return ALLOWED_EMAIL_DOMAINS.includes(normalizedDomain);
}
