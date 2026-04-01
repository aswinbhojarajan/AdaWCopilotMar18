import React from 'react';
import type { AdaBlockType } from '../../../../shared/schemas/agent';

interface StructuredSkeletonProps {
  expectedBlocks: AdaBlockType[];
}

function SkeletonPulse({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#e8e5de] rounded ${className}`} />;
}

function MetricsRowSkeleton() {
  return (
    <div className="flex gap-[8px] overflow-hidden">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex-shrink-0 min-w-[120px] bg-white rounded-[12px] px-[12px] py-[10px] border border-[#e8e5de]">
          <SkeletonPulse className="h-[8px] w-[60px] mb-[6px]" />
          <SkeletonPulse className="h-[18px] w-[80px] mb-[4px]" />
          <SkeletonPulse className="h-[8px] w-[40px]" />
        </div>
      ))}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] px-[14px] py-[12px]">
      <SkeletonPulse className="h-[14px] w-[60%] mb-[8px]" />
      <SkeletonPulse className="h-[10px] w-full mb-[4px]" />
      <SkeletonPulse className="h-[10px] w-[90%] mb-[4px]" />
      <SkeletonPulse className="h-[10px] w-[70%]" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] px-[10px] py-[8px]">
      <div className="flex gap-[16px] mb-[8px]">
        {[1, 2, 3].map(i => (
          <SkeletonPulse key={i} className="h-[8px] w-[50px]" />
        ))}
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-[16px] py-[6px]">
          <SkeletonPulse className="h-[10px] w-[60px]" />
          <SkeletonPulse className="h-[10px] w-[50px]" />
          <SkeletonPulse className="h-[10px] w-[40px]" />
        </div>
      ))}
    </div>
  );
}

function AllocationSkeleton() {
  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] px-[14px] py-[12px]">
      <SkeletonPulse className="h-[14px] w-[50%] mb-[12px]" />
      <div className="flex items-center gap-[16px]">
        <SkeletonPulse className="w-[100px] h-[100px] rounded-full" />
        <div className="flex-1 flex flex-col gap-[6px]">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-[6px]">
              <SkeletonPulse className="w-[8px] h-[8px] rounded-full" />
              <SkeletonPulse className="h-[8px] flex-1" />
              <SkeletonPulse className="h-[8px] w-[30px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskSkeleton() {
  return (
    <div className="rounded-[12px] bg-[#fff8e1] border border-[#ffe082] px-[14px] py-[12px]">
      <div className="flex items-center gap-[8px] mb-[6px]">
        <SkeletonPulse className="h-[16px] w-[60px] rounded-full" />
        <SkeletonPulse className="h-[8px] w-[80px]" />
      </div>
      <SkeletonPulse className="h-[14px] w-[70%] mb-[6px]" />
      <SkeletonPulse className="h-[10px] w-full mb-[3px]" />
      <SkeletonPulse className="h-[10px] w-[80%]" />
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] px-[14px] py-[12px]">
      <SkeletonPulse className="h-[12px] w-[50%] mb-[8px]" />
      <SkeletonPulse className="h-[10px] w-full mb-[4px]" />
      <SkeletonPulse className="h-[10px] w-[75%]" />
    </div>
  );
}

const SKELETON_MAP: Record<string, React.FC> = {
  metrics_row: MetricsRowSkeleton,
  section: SectionSkeleton,
  holdings_table: TableSkeleton,
  allocation_card: AllocationSkeleton,
  risk_card: RiskSkeleton,
  alert_banner: GenericSkeleton,
  advisor_cta: GenericSkeleton,
  mini_chart: AllocationSkeleton,
  comparison: TableSkeleton,
  opportunity_card: GenericSkeleton,
  scenario: GenericSkeleton,
};

export function StructuredSkeleton({ expectedBlocks }: StructuredSkeletonProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      {expectedBlocks.map((blockType, idx) => {
        const SkeletonComponent = SKELETON_MAP[blockType] || GenericSkeleton;
        return (
          <div
            key={idx}
            className="opacity-60"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <SkeletonComponent />
          </div>
        );
      })}
    </div>
  );
}
