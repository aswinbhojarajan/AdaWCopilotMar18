import React from 'react';

interface SuggestedQuestionProps {
  question: string;
  onClick?: () => void;
}

export function SuggestedQuestion({ question, onClick }: SuggestedQuestionProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#f7f6f2] content-stretch flex flex-col min-h-[48px] items-center justify-center px-[16px] rounded-[50px] shrink-0"
    >
      <p className="font-['DM_Sans',sans-serif] leading-[16.5px] not-italic text-[#555555] text-[0.75rem] text-center text-nowrap">
        {question}
      </p>
    </button>
  );
}
