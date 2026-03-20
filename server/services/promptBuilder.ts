import type { TenantConfig, PolicyDecision, IntentClassification } from '../../shared/schemas/agent';
import type { RiskProfile } from '../../shared/types';

interface PromptContext {
  tenantConfig: TenantConfig;
  policyDecision: PolicyDecision;
  intent: IntentClassification;
  userName?: string;
  riskProfile?: RiskProfile;
  portfolioSummary?: string;
  episodicMemories?: string[];
  semanticFacts?: string[];
  chatContext?: { category: string; title: string; sourceScreen?: string };
  toolNames?: string[];
}

export function buildAgentPrompt(ctx: PromptContext): string {
  const blocks: string[] = [];

  blocks.push(buildIdentityBlock(ctx.tenantConfig));
  blocks.push(buildTenantBehaviorBlock(ctx.tenantConfig));
  blocks.push(buildPolicyBlock(ctx.policyDecision));
  blocks.push(buildToolRulesBlock(ctx.toolNames ?? []));
  blocks.push(buildGroundingRules());
  blocks.push(buildAnswerContractBlock());

  if (ctx.userName || ctx.riskProfile) {
    blocks.push(buildUserProfileBlock(ctx.userName, ctx.riskProfile));
  }

  if (ctx.portfolioSummary) {
    blocks.push(`\nPORTFOLIO CONTEXT:\n${ctx.portfolioSummary}`);
  }

  if (ctx.semanticFacts && ctx.semanticFacts.length > 0) {
    blocks.push(`\nKNOWN USER PREFERENCES & FACTS:\n${ctx.semanticFacts.join('\n')}`);
  }

  if (ctx.episodicMemories && ctx.episodicMemories.length > 0) {
    blocks.push(`\nPREVIOUS CONVERSATION SUMMARIES:\n${ctx.episodicMemories.join('\n')}`);
  }

  if (ctx.chatContext) {
    blocks.push(`\nNAVIGATION CONTEXT: User came from the ${ctx.chatContext.sourceScreen || 'app'} screen, looking at "${ctx.chatContext.title}" (${ctx.chatContext.category}). Tailor your response to this context.`);
  }

  blocks.push(`\nCLASSIFIED INTENT: ${ctx.intent.primary_intent} (confidence: ${ctx.intent.confidence})`);

  return blocks.join('\n');
}

function buildIdentityBlock(config: TenantConfig): string {
  return `You are Ada, an AI wealth copilot for a premium wealth management platform.

PERSONALITY:
• Clear, jargon-free language calibrated for sophisticated but non-technical investors
• Action-oriented: always suggest concrete next steps
• Concise but thorough: use bullet points and structured formatting
• Warm and professional tone, like a trusted advisor
• Use • for bullet points, numbered lists (1. 2. 3.) for sequential steps
• Never use markdown headers (#), bold (**), or italic (*) formatting
• Keep responses focused and under 200 words unless the user asks for detail
• When discussing numbers, always use proper formatting ($X,XXX.XX for currency, X.X% for percentages)`;
}

function buildTenantBehaviorBlock(config: TenantConfig): string {
  return `
TENANT CONFIGURATION:
• Tone: ${config.tone}
• Language: ${config.language}
• Jurisdiction: ${config.jurisdiction}
• Advisory mode: ${config.advisory_mode}`;
}

function buildPolicyBlock(policy: PolicyDecision): string {
  let block = `
POLICY CONSTRAINTS:
• Response mode: ${policy.response_mode}
• Recommendation mode: ${policy.recommendation_mode}
• Disclosures required: ${policy.require_disclosures ? 'yes' : 'no'}`;

  if (policy.response_mode === 'education_only') {
    block += '\n• You may ONLY provide general educational information. Do NOT personalize advice.';
  } else if (policy.response_mode === 'personalized_insights') {
    block += '\n• You may provide personalized portfolio insights and next-best-action suggestions, but NOT specific product recommendations.';
  }

  if (policy.require_human_review) {
    block += `\n• ADVISOR HANDOFF REQUIRED: ${policy.escalation_reason || 'This topic requires advisor review.'}. Include an advisor handoff suggestion in your response.`;
  }

  return block;
}

function buildToolRulesBlock(toolNames: string[]): string {
  if (toolNames.length === 0) return '';

  return `
TOOL-USE RULES:
• You MUST call tools to get data before answering data-dependent questions
• NEVER invent portfolio values, prices, account balances, or performance figures
• Call tools in parallel when they are independent of each other
• If a tool returns an error, acknowledge the limitation and answer with available data
• Available tools: ${toolNames.join(', ')}`;
}

function buildGroundingRules(): string {
  return `
GROUNDING RULES:
• Portfolio claims (value, holdings, allocation, performance) MUST come from tool data
• Market claims (prices, changes, trends) MUST come from tool data
• If you don't have tool data for a claim, say "based on the available data" or ask the user
• Always cite the source when presenting financial data`;
}

function buildAnswerContractBlock(): string {
  return `
RESPONSE FORMAT:
• Lead with a clear headline answering the user's question
• Follow with a concise summary (2-3 sentences)
• Use bullet points for key details
• End with a suggested next step or action
• If disclosures are required, they will be appended automatically — do not add your own disclaimers`;
}

function buildUserProfileBlock(userName?: string, riskProfile?: RiskProfile): string {
  let block = '\nUSER PROFILE:';
  if (userName) block += `\nName: ${userName}`;
  if (riskProfile) {
    block += `\nRisk tolerance: ${riskProfile.level} (score ${riskProfile.score}/100)`;
    block += `\nCalibrate all investment language and risk framing to this ${riskProfile.level} risk profile.`;
  }
  return block;
}
