import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '../Button';
import type { LifeGapPromptResponse } from '../../../types';

interface LifeGapCardsProps {
  prompts: LifeGapPromptResponse[];
  onDismiss: (key: string) => void;
  onAction: (prompt: LifeGapPromptResponse) => void;
}

export function LifeGapCards({ prompts, onDismiss, onAction }: LifeGapCardsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="flex flex-col gap-[8px] w-full">
      {prompts.map((prompt) => (
        <div
          key={prompt.key}
          className="bg-white rounded-[20px] px-[20px] py-[16px] w-full"
        >
          <div className="flex items-start gap-[12px] w-full">
            <div className="shrink-0 size-[32px] rounded-full bg-[#fef3c7] flex items-center justify-center mt-[2px]">
              <Lightbulb className="size-[16px] text-[#d97706]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 flex flex-col gap-[8px] min-w-0">
              <div className="flex items-start justify-between gap-[8px]">
                <p className="font-['DM_Sans',sans-serif] font-semibold text-[#555555] text-[14px] leading-[1.3]">
                  {prompt.title}
                </p>
                <button
                  onClick={() => onDismiss(prompt.key)}
                  className="shrink-0 size-[20px] flex items-center justify-center rounded-full hover:bg-[#efede6] transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="size-[14px] text-[#555555] opacity-40" strokeWidth={2} />
                </button>
              </div>
              <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[13px] opacity-60 leading-[1.4]">
                {prompt.description}
              </p>
              <div className="mt-[4px]">
                <Button variant="ai-primary" size="sm" onClick={() => onAction(prompt)}>
                  {prompt.ctaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
