import type { TenantConfig, PolicyDecision } from '../../shared/schemas/agent';
import { checkBlockedPhrases } from './policyEngine';

export interface GuardrailResult {
  passed: boolean;
  interventions: string[];
  sanitizedText: string;
}

export function runPostChecks(
  responseText: string,
  tenantConfig: TenantConfig,
  policyDecision: PolicyDecision,
): GuardrailResult {
  const interventions: string[] = [];
  let sanitized = responseText;

  const blockedViolations = checkBlockedPhrases(responseText, tenantConfig);
  if (blockedViolations.length > 0) {
    interventions.push(...blockedViolations);
    for (const phrase of tenantConfig.blocked_phrases) {
      const regex = new RegExp(escapeRegex(phrase), 'gi');
      sanitized = sanitized.replace(regex, '[REDACTED]');
    }
  }

  if (policyDecision.response_mode === 'education_only') {
    const advisoryPatterns = [
      /\byou should (buy|sell|invest in|purchase|trade)\b/i,
      /\bi recommend (buying|selling|investing)\b/i,
      /\bmy recommendation is\b/i,
      /\bI advise you to\b/i,
    ];
    for (const pattern of advisoryPatterns) {
      if (pattern.test(sanitized)) {
        interventions.push(`Education-only mode: removed advisory language matching "${pattern.source}"`);
        sanitized = sanitized.replace(pattern, '[Consider discussing with your advisor about]');
      }
    }
  }

  if (!tenantConfig.can_name_securities) {
    const tickerPattern = /\b(?:buy|sell|invest in|consider|purchase|trade)\s+([A-Z]{1,5})\b/g;
    let match;
    while ((match = tickerPattern.exec(sanitized)) !== null) {
      interventions.push(`Removed specific security name: ${match[1]}`);
    }
    if (interventions.some(i => i.startsWith('Removed specific security name'))) {
      sanitized = sanitized.replace(tickerPattern, (full, ticker) => full.replace(ticker, '[a specific security]'));
    }
  }

  return {
    passed: interventions.length === 0,
    interventions,
    sanitizedText: sanitized,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
