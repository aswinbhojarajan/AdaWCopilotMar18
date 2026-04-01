import React, { useState, useEffect } from 'react';
import { ScenarioSimulator } from './ScenarioSimulator';
import { SparkIcon } from './SparkIcon';
import { ChatWidgetRenderer } from './ChatWidgets';
import { ChatResponseRenderer } from './blocks/ChatResponseRenderer';
import { StructuredSkeleton } from './blocks/StructuredSkeleton';
import type { ChatWidget, StructuredEnvelope } from '../../types';
import type { AdaBlockType } from '../../../shared/schemas/agent';

interface ChatMessageProps {
  message: string;
  sender: 'user' | 'assistant';
  timestamp?: string;
  contextPrefix?: string;
  simulator?: {
    type: 'retirement' | 'investment' | 'spending' | 'tax';
    initialValues?: Record<string, number>;
  };
  widgets?: ChatWidget[];
  isStreaming?: boolean;
  structuredEnvelope?: StructuredEnvelope;
  isSimplifiedView?: boolean;
  pendingExpectedBlocks?: string[];
  onFollowUp?: (prompt: string) => void;
}

export function ChatMessage({
  message,
  sender,
  timestamp: _timestamp,
  contextPrefix,
  simulator,
  widgets,
  isStreaming,
  structuredEnvelope,
  isSimplifiedView,
  pendingExpectedBlocks,
  onFollowUp,
}: ChatMessageProps) {
  const isUser = sender === 'user';
  const hasStructured = !isUser && structuredEnvelope && !isStreaming;
  const showSkeleton = !isUser && isStreaming && !structuredEnvelope && pendingExpectedBlocks && pendingExpectedBlocks.length > 0;
  const [blocksRevealed, setBlocksRevealed] = useState(false);

  useEffect(() => {
    if (hasStructured && !blocksRevealed) {
      const timer = setTimeout(() => setBlocksRevealed(true), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hasStructured, blocksRevealed]);

  const renderInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<React.Fragment key={key++}>{remaining.substring(0, boldMatch.index)}</React.Fragment>);
        }
        parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
        break;
      }
    }
    return parts;
  };

  const formatMessage = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n');
      const hasBullets = lines.some((line) => /^\s*[•\-–]\s/.test(line.trim()));
      const hasNumberedList = lines.some((line) => /^\d+[.)]\s/.test(line.trim()));

      if (hasBullets) {
        return (
          <div key={pIndex} className={pIndex > 0 ? 'mt-[12px]' : ''}>
            {lines.map((line, lIndex) => {
              const bulletMatch = line.trim().match(/^[•\-–]\s*(.*)/);
              if (bulletMatch) {
                return (
                  <div key={lIndex} className="flex gap-[8px] items-start mt-[4px]">
                    <span className={`${isUser ? 'text-white/70' : 'text-[#555555]'} mt-[2px] shrink-0`}>
                      •
                    </span>
                    <span className="flex-1">{renderInlineFormatting(bulletMatch[1])}</span>
                  </div>
                );
              } else if (line.trim()) {
                return (
                  <div key={lIndex} className={lIndex > 0 ? 'mt-[8px]' : ''}>
                    {renderInlineFormatting(line)}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      } else if (hasNumberedList) {
        return (
          <div key={pIndex} className={pIndex > 0 ? 'mt-[12px]' : ''}>
            {lines.map((line, lIndex) => {
              const numberedMatch = line.trim().match(/^(\d+[.)]\s*)(.*)/);
              if (numberedMatch) {
                return (
                  <div key={lIndex} className="flex gap-[8px] items-start mt-[4px]">
                    <span className={`${isUser ? 'text-white/70' : 'text-[#555555]'} mt-[2px] shrink-0`}>
                      {numberedMatch[1].trim()}
                    </span>
                    <span className="flex-1">{renderInlineFormatting(numberedMatch[2])}</span>
                  </div>
                );
              } else if (line.trim()) {
                return (
                  <div key={lIndex} className={lIndex > 0 ? 'mt-[8px]' : ''}>
                    {renderInlineFormatting(line)}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      } else {
        return (
          <p key={pIndex} className={pIndex > 0 ? 'mt-[12px]' : ''}>
            {renderInlineFormatting(paragraph)}
          </p>
        );
      }
    });
  };

  if (showSkeleton) {
    return (
      <div className="flex justify-start w-full">
        <div className="flex gap-[10px] items-start w-full max-w-[95%]">
          <div className="bg-[#441316] rounded-full size-[28px] shrink-0 flex items-center justify-center mt-[4px]">
            <SparkIcon size={16} color="#d8d8d8" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
            {message && (
              <div className="bg-[#f7f6f2] rounded-[16px] px-[16px] py-[12px]">
                <p className="font-['Crimson_Pro',serif] text-[#333] text-[1rem] tracking-[-0.32px] font-medium leading-[1.4]">
                  {message}
                  <span className="inline-block w-[6px] h-[14px] bg-[#441316] animate-pulse ml-[2px] align-middle rounded-sm" />
                </p>
              </div>
            )}
            <StructuredSkeleton expectedBlocks={pendingExpectedBlocks as AdaBlockType[]} />
          </div>
        </div>
      </div>
    );
  }

  if (hasStructured) {
    return (
      <div className="flex justify-start w-full">
        <div className="flex gap-[10px] items-start w-full max-w-[95%]">
          <div className="bg-[#441316] rounded-full size-[28px] shrink-0 flex items-center justify-center mt-[4px]">
            <SparkIcon size={16} color="#d8d8d8" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
            <div className="bg-[#f7f6f2] rounded-[16px] px-[16px] py-[12px]">
              <p className="font-['Crimson_Pro',serif] text-[#333] text-[1rem] tracking-[-0.32px] font-medium leading-[1.4]">
                {structuredEnvelope.headline}
              </p>
            </div>

            <ChatResponseRenderer
              envelope={structuredEnvelope}
              onFollowUp={onFollowUp || (() => {})}
              isRevealed={blocksRevealed}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className="flex gap-[10px] items-start max-w-[85%]">
        {!isUser && (
          <div className="bg-[#441316] rounded-full size-[28px] shrink-0 flex items-center justify-center mt-[4px]">
            <SparkIcon size={16} color="#d8d8d8" />
          </div>
        )}

        <div
          className={`
          relative rounded-[16px] flex-1
          ${isUser ? 'bg-[#441316]' : 'bg-[#f7f6f2]'}
        `}
        >
          <div className="flex items-center justify-center overflow-clip rounded-[inherit]">
            <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-[12px] relative w-full">
              <div
                className={`font-['DM_Sans',sans-serif] font-light ${isUser ? 'text-white' : 'text-[#555555]'} text-[0.8125rem] leading-[20.8px]`}
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {contextPrefix && isUser && (
                  <span className="text-white/70 font-['DM_Sans',sans-serif] font-light text-[0.75rem] tracking-[-0.24px]">
                    {contextPrefix} ·
                  </span>
                )}
                {formatMessage(message)}
              </div>

              {isStreaming && !isUser && (
                <span className="inline-block w-[6px] h-[14px] bg-[#441316] animate-pulse ml-[2px] align-middle rounded-sm" />
              )}

              {isSimplifiedView && !isUser && (
                <div className="mt-[6px] flex items-center gap-[4px]">
                  <svg className="w-[10px] h-[10px] text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-['DM_Sans',sans-serif] text-[#999] text-[0.5625rem]">Simplified view</span>
                </div>
              )}

              {widgets && widgets.length > 0 && !isUser && (
                <div className="mt-[8px]">
                  {widgets.map((widget, idx) => (
                    <ChatWidgetRenderer key={idx} widget={widget} />
                  ))}
                </div>
              )}

              {simulator && !isUser && (
                <ScenarioSimulator type={simulator.type} initialValues={simulator.initialValues} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
