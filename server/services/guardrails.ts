import type { TenantConfig, PolicyDecision, ToolResult } from '../../shared/schemas/agent';
import { checkBlockedPhrases } from './policyEngine';

export interface GuardrailResult {
  passed: boolean;
  interventions: string[];
  sanitizedText: string;
  appendedDisclosures: string[];
}

export function runPostChecks(
  responseText: string,
  tenantConfig: TenantConfig,
  policyDecision: PolicyDecision,
  toolResults?: ToolResult[],
): GuardrailResult {
  const interventions: string[] = [];
  let sanitized = responseText;
  const appendedDisclosures: string[] = [];

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

  if (toolResults && toolResults.length > 0) {
    const freshness = tenantConfig.data_freshness_threshold_seconds ?? 300;
    const now = Date.now();
    for (const tr of toolResults) {
      if (tr.status === 'ok' && tr.as_of) {
        const age = (now - new Date(tr.as_of).getTime()) / 1000;
        if (age > freshness) {
          interventions.push(`Data from ${tr.source_name} is ${Math.round(age)}s old (threshold: ${freshness}s)`);
        }
      }
    }
  }

  if (policyDecision.require_disclosures) {
    const hasDisclosureLike = /past performance|not .* financial advice|consult .* advisor/i.test(sanitized);
    if (!hasDisclosureLike) {
      appendedDisclosures.push('Past performance is not indicative of future results. This information does not constitute financial advice.');
    }
  }

  if (toolResults && toolResults.length > 0) {
    const okTools = toolResults.filter(r => r.status === 'ok');
    const hasCurrencyMention = /\$[\d,.]+/.test(sanitized);
    if (hasCurrencyMention && okTools.length === 0) {
      interventions.push('Response contains financial figures without successful tool data backing');
    }

    if (okTools.length > 0) {
      const sourceNames = okTools.map(t => t.source_name.toLowerCase());
      const citationPattern = /(?:source|via|from|according to)[:\s]+(\w[\w\s]*?)(?:\.|,|\n|$)/gi;
      const mentionedSources: string[] = [];
      let citMatch;
      while ((citMatch = citationPattern.exec(sanitized)) !== null) {
        mentionedSources.push(citMatch[1].trim().toLowerCase());
      }
      const uncitedSources = sourceNames.filter(sn =>
        !mentionedSources.some(ms => ms.includes(sn) || sn.includes(ms))
      );
      if (uncitedSources.length > 0 && hasCurrencyMention) {
        interventions.push(`Data-backed claims may lack citations for: ${uncitedSources.join(', ')}`);
      }
    }
  }

  return {
    passed: interventions.length === 0,
    interventions,
    sanitizedText: sanitized,
    appendedDisclosures,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
