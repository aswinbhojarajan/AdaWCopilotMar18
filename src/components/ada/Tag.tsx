import React from 'react';

interface TagProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function Tag({ children, active = false, onClick }: TagProps) {
  return (
    <button
      onClick={onClick}
      className={`
        content-stretch 
        flex 
        h-[24px] 
        items-center 
        justify-center 
        px-[8px] 
        py-[10px] 
        relative 
        rounded-[50px] 
        shrink-0
        ${!active ? 'opacity-50' : ''}
      `}
    >
      <div
        aria-hidden="true"
        className="absolute border-[#441316] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]"
      />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#441316] text-[12px] text-nowrap whitespace-pre">
        {children}
      </p>
    </button>
  );
}
