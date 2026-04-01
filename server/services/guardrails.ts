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

  const executionPatterns: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bI will (place|submit|execute|process|make) (the |your |this |a )?(order|trade|transaction|purchase|sale)\b/gi, replacement: "I've prepared this plan for your advisor to review and execute" },
    { pattern: /\bI('ll| will) (buy|sell|trade|transfer|wire|move) .*?(for you|on your behalf|now)\b/gi, replacement: "I've prepared this recommendation for your advisor to review" },
    { pattern: /\b(executing|processing|submitting|placing) (the |your |this )?(order|trade|transaction)s? now\b/gi, replacement: 'routing this to your advisor for execution' },
    { pattern: /\border (has been |is |was )?(submitted|placed|executed|confirmed|processed)\b/gi, replacement: 'plan has been sent to your advisor for review' },
    { pattern: /\btrade (has been |is |was )?(confirmed|executed|completed|processed)\b/gi, replacement: 'plan has been sent to your advisor for review' },
    { pattern: /\bI('ll| will| can) execute\b/gi, replacement: "I'll prepare this for your advisor to execute" },
    { pattern: /\bI('ll| will| can) place (the |your |this |a )?order/gi, replacement: "I'll send this plan to your advisor" },
  ];

  for (const { pattern, replacement } of executionPatterns) {
    if (pattern.test(sanitized)) {
      interventions.push(`Execution boundary: replaced language matching "${pattern.source}"`);
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  const hardExecutionCheck = /\b(I will|I'll|I can|I'm going to|ready to|about to|proceeding to) (execute|place|submit|process|complete|finalize|carry out) (the |your |this |a )?(trade|order|transaction|purchase|sale|execution)/i;
  if (hardExecutionCheck.test(sanitized)) {
    interventions.push('Execution boundary: hard check triggered — execution-claiming language survived sanitization');
    sanitized = sanitized.replace(hardExecutionCheck, "I've prepared this for your advisor to review and execute");
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
    const staleSources: string[] = [];
    for (const tr of toolResults) {
      if (tr.status === 'ok' && tr.as_of) {
        const age = (now - new Date(tr.as_of).getTime()) / 1000;
        if (age > freshness) {
          staleSources.push(tr.source_name);
          interventions.push(`Data from ${tr.source_name} is ${Math.round(age)}s old (threshold: ${freshness}s)`);
        }
      }
    }
    if (staleSources.length > 0) {
      appendedDisclosures.push(`Note: Some data may not reflect the latest market conditions (sources: ${staleSources.join(', ')}). Please verify with your advisor for time-sensitive decisions.`);
    }
  }

  if (toolResults && toolResults.length > 0) {
    const okTools = toolResults.filter(r => r.status === 'ok');
    const hasCurrencyMention = /\$[\d,.]+/.test(sanitized);
    if (hasCurrencyMention && okTools.length === 0) {
      interventions.push('Response contains financial figures without successful tool data backing');
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
