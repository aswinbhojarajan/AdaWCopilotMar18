import React from 'react';

interface SuggestedQuestionProps {
  question: string;
  onClick?: () => void;
}

export function SuggestedQuestion({ question, onClick }: SuggestedQuestionProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#f7f6f2] content-stretch flex flex-col h-[29.5px] items-start pb-[0.5px] pt-[6.5px] px-[12.5px] rounded-[50px] shrink-0"
    >
      <div className="h-[16.5px] relative shrink-0">
        <p className="font-['DM_Sans',sans-serif] leading-[16.5px] not-italic text-[#555555] text-[11px] text-center text-nowrap">
          {question}
        </p>
      </div>
    </button>
  );
}
