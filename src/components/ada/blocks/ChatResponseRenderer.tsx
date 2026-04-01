import React from 'react';
import type { AdaResponseEnvelope, AdaBlock, MetricsRowBlock, SectionBlock, HoldingsTableBlock, AllocationCardBlock, RiskCardBlock, AlertBannerBlock, AdvisorCtaBlock } from '../../../../shared/schemas/agent';
import { MetricsRow } from './MetricsRow';
import { Section } from './Section';
import { HoldingsTable } from './HoldingsTable';
import { AllocationCard } from './AllocationCard';
import { RiskCard } from './RiskCard';
import { AlertBanner } from './AlertBanner';
import { AdvisorCta } from './AdvisorCta';
import { FollowUpChips } from './FollowUpChips';

interface ChatResponseRendererProps {
  envelope: AdaResponseEnvelope;
  onFollowUp: (prompt: string) => void;
  isRevealed?: boolean;
}

type BlockComponentMap = {
  metrics_row: React.ComponentType<{ block: MetricsRowBlock }>;
  section: React.ComponentType<{ block: SectionBlock }>;
  holdings_table: React.ComponentType<{ block: HoldingsTableBlock }>;
  allocation_card: React.ComponentType<{ block: AllocationCardBlock }>;
  risk_card: React.ComponentType<{ block: RiskCardBlock }>;
  alert_banner: React.ComponentType<{ block: AlertBannerBlock }>;
  advisor_cta: React.ComponentType<{ block: AdvisorCtaBlock; onChipTap?: (prompt: string) => void }>;
};

const BLOCK_REGISTRY: BlockComponentMap = {
  metrics_row: MetricsRow,
  section: Section,
  holdings_table: HoldingsTable,
  allocation_card: AllocationCard,
  risk_card: RiskCard,
  alert_banner: AlertBanner,
  advisor_cta: AdvisorCta,
};

function renderBlock(block: AdaBlock, index: number, onFollowUp: (prompt: string) => void, isRevealed: boolean) {
  const Component = BLOCK_REGISTRY[block.type as keyof BlockComponentMap] as React.ComponentType<{ block: AdaBlock; onChipTap?: (prompt: string) => void }> | undefined;
  if (!Component) return null;

  const delay = index * 50;

  return (
    <div
      key={index}
      className={`transition-all duration-300 ${
        isRevealed
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-[8px]'
      }`}
      style={{ transitionDelay: isRevealed ? `${delay}ms` : '0ms' }}
    >
      <Component block={block} onChipTap={onFollowUp} />
    </div>
  );
}

export function ChatResponseRenderer({ envelope, onFollowUp, isRevealed = true }: ChatResponseRendererProps) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <div className="flex flex-col gap-[8px]">
        {envelope.blocks.map((block, idx) => renderBlock(block, idx, onFollowUp, isRevealed))}
      </div>

      {envelope.followUps.length > 0 && (
        <div
          className={`transition-all duration-300 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[8px]'
          }`}
          style={{ transitionDelay: isRevealed ? `${(envelope.blocks.length + 1) * 50}ms` : '0ms' }}
        >
          <FollowUpChips chips={envelope.followUps} onTap={onFollowUp} />
        </div>
      )}

    </div>
  );
}
