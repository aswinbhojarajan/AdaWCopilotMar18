import React, { useState } from 'react';

interface ThinkingStep {
  step: string;
  detail: string;
  timestamp: number;
}

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isStreaming: boolean;
}

const STEP_LABELS: Record<string, string> = {
  pii_scan: 'Privacy Scan',
  intent_classification: 'Understanding Query',
  policy_evaluation: 'Policy Check',
  routing: 'Selecting Model',
  model_selection: 'Model Configuration',
  data_prefetch: 'Gathering Data',
  llm_generation: 'Generating Response',
  llm_retry: 'Retrying',
  llm_fallback: 'Fallback',
  guardrails: 'Safety Checks',
  lane0_dispatch: 'Fast Path',
  lane_upgrade: 'Lane Upgrade',
};

function buildCompletedSummary(steps: ThinkingStep[]): string {
  const parts: string[] = [];
  const intentStep = steps.find(s => s.step === 'intent_classification');
  if (intentStep) {
    const match = intentStep.detail.match(/Intent:\s*(\w+)/);
    if (match) parts.push(match[1]);
  }
  const routeStep = steps.find(s => s.step === 'routing');
  if (routeStep) {
    const laneMatch = routeStep.detail.match(/Lane:\s*(\w+)/);
    if (laneMatch) parts.push(`Lane ${laneMatch[1]}`);
  }
  const modelStep = steps.find(s => s.step === 'model_selection');
  if (modelStep) {
    const modelMatch = modelStep.detail.match(/Model:\s*([^\s(,]+)/);
    if (modelMatch) parts.push(modelMatch[1]);
  }
  if (parts.length > 0) {
    return `${parts.join(' → ')} (${steps.length} steps)`;
  }
  return `${steps.length} steps completed`;
}

export function ThinkingPanel({ steps, isStreaming }: ThinkingPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0) return null;

  const latestStep = steps[steps.length - 1];

  return (
    <div className="self-start w-full max-w-[95%] mb-[4px]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[12px] bg-[#f0ede5] border border-[#ddd8cc] text-left w-full transition-colors hover:bg-[#e8e4db]"
      >
        <div className={`w-[8px] h-[8px] rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
        <span className="font-['DM_Sans',sans-serif] text-[11px] text-[#777] tracking-[-0.2px] flex-1 truncate">
          {isStreaming
            ? `Thinking: ${STEP_LABELS[latestStep?.step] || latestStep?.step || '...'}`
            : buildCompletedSummary(steps)
          }
        </span>
        <svg
          className={`w-[12px] h-[12px] text-[#999] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-[4px] rounded-[12px] bg-[#f7f5ef] border border-[#e3e0d6] px-[12px] py-[8px] space-y-[6px]">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-[8px]">
              <div className="mt-[5px] w-[6px] h-[6px] rounded-full bg-[#bbb] shrink-0" />
              <div className="min-w-0">
                <p className="font-['DM_Sans:Medium',sans-serif] text-[11px] text-[#555] tracking-[-0.2px]">
                  {STEP_LABELS[s.step] || s.step}
                </p>
                <p className="font-['DM_Sans:Light',sans-serif] text-[10px] text-[#888] tracking-[-0.2px] break-words">
                  {s.detail}
                </p>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex items-center gap-[4px] pt-[2px]">
              <div className="w-[4px] h-[4px] bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-[4px] h-[4px] bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-[4px] h-[4px] bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
