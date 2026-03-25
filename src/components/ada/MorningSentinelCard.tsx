import React from 'react';
import { SparkIcon } from './SparkIcon';
import { Skeleton } from './Skeleton';
import type {
  MorningSentinelResponse,
  MorningSentinelRisk,
  MorningSentinelAction,
  MorningSentinelKeyMover,
  ChatContext,
} from '../../types';

interface MorningSentinelCardProps {
  data: MorningSentinelResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  isStreaming?: boolean;
  streamingMetrics?: Partial<MorningSentinelResponse> | null;
  streamingText?: string;
  onRetry: () => void;
  onChatSubmit?: (message: string, context?: ChatContext) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function SeverityDot({ severity }: { severity: MorningSentinelRisk['severity'] }) {
  const colors = {
    high: 'bg-[#c0392b]',
    medium: 'bg-[#e67e22]',
    low: 'bg-[#27ae60]',
  };
  return <div className={`size-[8px] rounded-full ${colors[severity]} shrink-0 mt-[6px]`} />;
}

function KeyMoverRow({ mover }: { mover: MorningSentinelKeyMover }) {
  const isUp = mover.direction === 'up';
  return (
    <div className="flex items-center justify-between py-[8px]">
      <div className="flex items-center gap-[10px]">
        <div className="bg-[#f7f6f2] rounded-full size-[32px] flex items-center justify-center shrink-0">
          <span className="font-['DM_Sans',sans-serif] font-semibold text-[0.625rem] text-[#555555] tracking-[0.5px]">
            {mover.symbol.slice(0, 3)}
          </span>
        </div>
        <div>
          <p className="font-['DM_Sans',sans-serif] text-[0.8125rem] text-[#333333]">
            {mover.name}
          </p>
          <p className="font-['DM_Sans',sans-serif] text-[0.6875rem] text-[#888888]">
            {mover.detail}
          </p>
        </div>
      </div>
      <div className={`flex items-center gap-[4px] ${isUp ? 'text-[#03561a]' : 'text-[#c0392b]'}`}>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          {isUp ? (
            <path d="M4 0 L8 8 L0 8 Z" fill="currentColor" />
          ) : (
            <path d="M4 8 L8 0 L0 0 Z" fill="currentColor" />
          )}
        </svg>
        <span className="font-['DM_Sans',sans-serif] text-[0.6875rem]">
          {isUp ? 'Up' : 'Down'}
        </span>
      </div>
    </div>
  );
}

function RiskRow({ risk }: { risk: MorningSentinelRisk }) {
  return (
    <div className="flex gap-[10px] py-[6px]">
      <SeverityDot severity={risk.severity} />
      <div className="flex-1">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-[0.8125rem] text-[#333333]">
          {risk.title}
        </p>
        <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#777777] leading-[18px]">
          {risk.description}
        </p>
      </div>
    </div>
  );
}

function ActionRow({
  action,
  onChatSubmit,
}: {
  action: MorningSentinelAction;
  onChatSubmit?: (message: string, context?: ChatContext) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-[12px] py-[8px]">
      <div className="flex-1">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-[0.8125rem] text-[#333333]">
          {action.title}
        </p>
        <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#777777] leading-[18px]">
          {action.description}
        </p>
      </div>
      <button
        onClick={() =>
          onChatSubmit?.(action.ctaMessage, {
            category: 'MORNING SENTINEL',
            categoryType: 'SUGGESTED ACTION',
            title: action.title,
            sourceScreen: 'home',
          })
        }
        className="bg-[#441316] shrink-0 flex items-center gap-[4px] px-[12px] py-[6px] rounded-full mt-[2px]"
      >
        <SparkIcon size={12} color="#d8d8d8" />
        <span className="font-['DM_Sans',sans-serif] text-[0.6875rem] text-white whitespace-nowrap">
          {action.ctaText}
        </span>
      </button>
    </div>
  );
}

function SentinelSkeleton() {
  return (
    <div className="bg-white rounded-[30px] w-full">
      <div className="p-[24px] space-y-[16px]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-[12px] w-[80px]" />
          <Skeleton className="h-[12px] w-[100px]" />
          <Skeleton className="h-[12px] w-[80px]" />
        </div>
        <div className="h-[0.5px] bg-[#555555] opacity-30 w-full" />
        <Skeleton className="h-[20px] w-[85%] mx-auto" />
        <Skeleton className="h-[16px] w-[60%] mx-auto" />
        <div className="space-y-[12px] pt-[8px]">
          <Skeleton className="h-[10px] w-[120px]" />
          <Skeleton className="h-[40px] w-[180px]" />
        </div>
        <div className="space-y-[8px] pt-[8px]">
          <Skeleton className="h-[10px] w-[100px]" />
          <Skeleton className="h-[48px] w-full" />
          <Skeleton className="h-[48px] w-full" />
        </div>
        <div className="space-y-[8px] pt-[8px]">
          <Skeleton className="h-[10px] w-[80px]" />
          <Skeleton className="h-[14px] w-full" />
          <Skeleton className="h-[14px] w-[70%]" />
        </div>
        <div className="space-y-[8px] pt-[8px]">
          <Skeleton className="h-[10px] w-[130px]" />
          <Skeleton className="h-[52px] w-full" />
        </div>
      </div>
    </div>
  );
}

function StreamingSentinel({ metrics, text }: { metrics: Partial<MorningSentinelResponse> | null; text: string }) {
  const hasMetrics = metrics && metrics.portfolioValue !== undefined;
  const isPositive = (metrics?.dailyChangeAmount ?? 0) >= 0;

  return (
    <div className="bg-white rounded-[30px] w-full">
      <div className="p-[24px]">
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-end justify-between w-full">
              <div className="flex flex-col font-['DM_Sans',sans-serif] h-[7px] justify-center leading-[0] text-[#555555] text-[0.5625rem] w-[75px]">
                <p className="leading-[18px]">{hasMetrics ? `Updated ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}</p>
              </div>
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[#992929] text-[0.625rem] text-center tracking-[0.8px] uppercase w-[138px]">
                MORNING SENTINEL
              </p>
              <p className="font-['DM_Sans',sans-serif] h-[17px] leading-[28px] text-[#555555] text-[0.5625rem] text-right w-[75px]">
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="h-[0.5px] bg-[#555555] opacity-30 w-full" />
          </div>

          {hasMetrics && (
            <div className="flex flex-col gap-[12px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[rgba(85,85,85,0.8)] text-[0.625rem] tracking-[0.8px] uppercase">
                Portfolio Value
              </p>
              <div className="flex items-end justify-between">
                <p className="font-['Crimson_Pro',sans-serif] font-extralight leading-[28px] text-[#555555] text-[2.5rem] tracking-[-1.2px]">
                  {formatCurrency(metrics.portfolioValue!)}
                </p>
                <div className={`${isPositive ? 'bg-[#c6ff6a]' : 'bg-[#ffd4d4]'} flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] rounded-[50px]`}>
                  <div className="size-[8px]">
                    <svg className="block size-full" fill="none" viewBox="0 0 8 8">
                      {isPositive ? (
                        <path d="M4 0 L8 8 L0 8 Z" fill="#03561A" />
                      ) : (
                        <path d="M4 8 L8 0 L0 0 Z" fill="#c0392b" />
                      )}
                    </svg>
                  </div>
                  <p className={`font-['DM_Sans',sans-serif] text-[0.75rem] ${isPositive ? 'text-[#03561a]' : 'text-[#c0392b]'}`}>
                    {`${isPositive ? '+' : ''}${formatCurrency(metrics.dailyChangeAmount!)} (${isPositive ? '+' : ''}${metrics.dailyChangePercent}%) 1D`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {text ? (
            <div className="flex flex-col gap-[8px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[rgba(85,85,85,0.8)] text-[0.625rem] tracking-[0.8px] uppercase">
                Generating your briefing...
              </p>
              <div className="bg-[#f7f6f2] rounded-[16px] px-[16px] py-[12px] min-h-[60px] flex items-center gap-[10px]">
                <span className="inline-block w-[6px] h-[14px] bg-[#992929] animate-pulse rounded-sm shrink-0" />
                <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#777777] leading-[18px]">
                  Ada is analyzing your portfolio and market data...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-[12px]">
              <Skeleton className="h-[20px] w-[85%] mx-auto" />
              <Skeleton className="h-[16px] w-[60%] mx-auto" />
              <div className="space-y-[8px] pt-[8px]">
                <Skeleton className="h-[48px] w-full" />
                <Skeleton className="h-[48px] w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MorningSentinelCard({
  data,
  isLoading,
  isError,
  isStreaming,
  streamingMetrics,
  streamingText,
  onRetry,
  onChatSubmit,
}: MorningSentinelCardProps) {
  if (isStreaming) {
    return <StreamingSentinel metrics={streamingMetrics ?? null} text={streamingText ?? ''} />;
  }

  if (isLoading) {
    return <SentinelSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-[30px] w-full p-[24px]">
        <p className="font-['DM_Sans',sans-serif] text-[0.875rem] text-[#555555] text-center">
          Unable to generate your briefing right now.
        </p>
        <button
          onClick={onRetry}
          className="mt-[12px] mx-auto block font-['DM_Sans',sans-serif] text-[0.8125rem] text-[#992929] underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const changeSign = data.dailyChangeAmount >= 0 ? '+' : '';
  const changeText = `${changeSign}${formatCurrency(data.dailyChangeAmount)} (${changeSign}${data.dailyChangePercent}%) 1D`;
  const isPositive = data.dailyChangeAmount >= 0;

  return (
    <div className="bg-white rounded-[30px] w-full">
      <div className="p-[24px]">
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-end justify-between w-full">
              <div className="flex flex-col font-['DM_Sans',sans-serif] h-[7px] justify-center leading-[0] text-[#555555] text-[0.5625rem] w-[75px]">
                <p className="leading-[18px]">Updated {formatTime(data.generatedAt)}</p>
              </div>
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[#992929] text-[0.625rem] text-center tracking-[0.8px] uppercase w-[138px]">
                MORNING SENTINEL
              </p>
              <p className="font-['DM_Sans',sans-serif] h-[17px] leading-[28px] text-[#555555] text-[0.5625rem] text-right w-[75px]">
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="h-[0.5px] bg-[#555555] opacity-30 w-full" />
          </div>

          <div className="text-center">
            <p className="font-['Crimson_Pro',sans-serif] text-[1.125rem] text-[#555555] tracking-[-0.36px] leading-normal">
              {data.headline}
            </p>
          </div>

          <p className="font-['Crimson_Pro',sans-serif] text-[0.9375rem] text-[#555555] tracking-[-0.3px] leading-[22px] text-center opacity-70">
            {data.overview}
          </p>

          <div className="flex flex-col gap-[12px]">
            <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[rgba(85,85,85,0.8)] text-[0.625rem] tracking-[0.8px] uppercase">
              Portfolio Value
            </p>
            <div className="flex items-end justify-between">
              <p className="font-['Crimson_Pro',sans-serif] font-extralight leading-[28px] text-[#555555] text-[2.5rem] tracking-[-1.2px]">
                {formatCurrency(data.portfolioValue)}
              </p>
              <div className={`${isPositive ? 'bg-[#c6ff6a]' : 'bg-[#ffd4d4]'} flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] rounded-[50px]`}>
                <div className="size-[8px]">
                  <svg className="block size-full" fill="none" viewBox="0 0 8 8">
                    {isPositive ? (
                      <path d="M4 0 L8 8 L0 8 Z" fill="#03561A" />
                    ) : (
                      <path d="M4 8 L8 0 L0 0 Z" fill="#c0392b" />
                    )}
                  </svg>
                </div>
                <p className={`font-['DM_Sans',sans-serif] text-[0.75rem] ${isPositive ? 'text-[#03561a]' : 'text-[#c0392b]'}`}>
                  {changeText}
                </p>
              </div>
            </div>
          </div>

          {data.keyMovers.length > 0 && (
            <div className="flex flex-col gap-[4px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[rgba(85,85,85,0.8)] text-[0.625rem] tracking-[0.8px] uppercase">
                Key Movers
              </p>
              <div className="divide-y divide-[#f0efe9]">
                {data.keyMovers.map((mover, i) => (
                  <KeyMoverRow key={i} mover={mover} />
                ))}
              </div>
            </div>
          )}

          {data.risks.length > 0 && (
            <div className="flex flex-col gap-[6px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[rgba(85,85,85,0.8)] text-[0.625rem] tracking-[0.8px] uppercase">
                Flagged Risks
              </p>
              {data.risks.map((risk, i) => (
                <RiskRow key={i} risk={risk} />
              ))}
            </div>
          )}

          {data.actions.length > 0 && (
            <div className="flex flex-col gap-[4px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] text-[rgba(85,85,85,0.8)] text-[0.625rem] tracking-[0.8px] uppercase">
                Suggested Actions
              </p>
              <div className="divide-y divide-[#f0efe9]">
                {data.actions.map((action, i) => (
                  <ActionRow key={i} action={action} onChatSubmit={onChatSubmit} />
                ))}
              </div>
            </div>
          )}

          {data.benchmarkNote && (
            <div className="bg-[#f7f6f2] rounded-[16px] px-[16px] py-[12px]">
              <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#777777] leading-[18px]">
                {data.benchmarkNote}
              </p>
            </div>
          )}

          <div className="flex gap-[10px]">
            <button
              onClick={() =>
                onChatSubmit?.('Give me a detailed analysis of my portfolio performance and any risks I should be aware of', {
                  category: 'MORNING SENTINEL',
                  categoryType: 'DEEP DIVE',
                  title: data.headline,
                  sourceScreen: 'home',
                })
              }
              className="bg-[#441316] flex gap-[6px] h-[48px] items-center justify-center px-[14px] py-[10px] rounded-[50px]"
            >
              <div className="size-[24px] flex items-center justify-center">
                <SparkIcon />
              </div>
              <p className="font-['DM_Sans',sans-serif] text-white text-[0.75rem] whitespace-nowrap">
                Dive deeper
              </p>
            </button>
            <button
              onClick={() =>
                onChatSubmit?.('What should I focus on with my portfolio this week?', {
                  category: 'MORNING SENTINEL',
                  categoryType: 'WEEKLY FOCUS',
                  title: 'Weekly portfolio focus',
                  sourceScreen: 'home',
                })
              }
              className="relative flex h-[48px] items-center justify-center px-[14px] py-[10px] rounded-[50px]"
            >
              <div className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
              <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.75rem] whitespace-nowrap">
                Weekly focus
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
