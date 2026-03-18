const PII_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: 'email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'phone', pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { name: 'credit_card', pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
  { name: 'passport', pattern: /\b[A-Z]{1,2}\d{6,9}\b/g },
  { name: 'iban', pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g },
];

export interface PiiScanResult {
  hasPii: boolean;
  types: string[];
  sanitized: string;
}

export function scanForPii(text: string): PiiScanResult {
  const detectedTypes: string[] = [];
  let sanitized = text;

  for (const { name, pattern } of PII_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detectedTypes.push(name);
      sanitized = sanitized.replace(pattern, `[REDACTED_${name.toUpperCase()}]`);
    }
  }

  return {
    hasPii: detectedTypes.length > 0,
    types: detectedTypes,
    sanitized,
  };
}
