import type { DemoPersonaIdentity } from './types';

export const PII_KEYS = new Set([
  'client_id', 'full_name', 'email', 'phone',
  'national_id', 'date_of_birth', 'address',
  'account_number', 'iban', 'holding_id',
  'balance', 'portfolio_value', 'transaction_amount',
  'net_worth', 'income',
  'message_content', 'llm_response_content',
  'advisor_notes', 'document_content',
]);

export const PII_PATTERNS = {
  UUID: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  ACCOUNT_NUMBER: /\b\d{10,16}\b/g,
  IBAN: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,}\b/g,
};

export function sanitizeProperties(
  props: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !PII_KEYS.has(key)),
  );
}

export const DEMO_PERSONAS: Record<string, DemoPersonaIdentity> = {
  'user-aisha': {
    distinctId: 'demo_aisha_01',
    traits: {
      persona: 'Priority Banking',
      market: 'UAE',
      segment: 'priority_banking',
      risk_profile_tier: 'moderate',
      rm_assigned: true,
      demo_dataset: 'wealth_mock_v1',
      cohort: 'internal_demo',
    },
  },
  'user-khalid': {
    distinctId: 'demo_khalid_01',
    traits: {
      persona: 'Conservative Investor',
      market: 'UAE',
      segment: 'conservative',
      risk_profile_tier: 'conservative',
      rm_assigned: true,
      demo_dataset: 'wealth_mock_v1',
      cohort: 'internal_demo',
    },
  },
  'user-raj': {
    distinctId: 'demo_raj_01',
    traits: {
      persona: 'Growth Investor',
      market: 'UAE',
      segment: 'aggressive',
      risk_profile_tier: 'aggressive',
      rm_assigned: true,
      demo_dataset: 'wealth_mock_v1',
      cohort: 'internal_demo',
    },
  },
  'admin': {
    distinctId: 'demo_admin_01',
    traits: {
      persona: 'Admin',
      market: 'UAE',
      segment: 'admin',
      cohort: 'internal_demo',
    },
  },
};
