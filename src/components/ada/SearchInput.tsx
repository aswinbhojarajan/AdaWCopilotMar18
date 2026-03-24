import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({
  placeholder = 'Search Threads',
  value = '',
  onChange,
}: SearchInputProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[22px] py-[8px] relative w-full">
          <Search className="size-[15px] text-[#cacaca]" strokeWidth={1.2} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="flex-1 font-['DM_Sans',sans-serif] font-medium text-[#cacaca] text-[14px] tracking-[-0.28px] bg-transparent border-none outline-none placeholder:text-[#cacaca]"
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[30px]"
      />
    </div>
  );
}
