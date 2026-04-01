import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

const DEFAULT_DISCLOSURES = [
  'Past performance is not indicative of future results.',
  'This information is for educational purposes and does not constitute financial advice.',
  'Please consult your financial advisor before making investment decisions.',
];

interface DisclaimerFooterProps {
  disclosures?: string[];
}

export function DisclaimerFooter({ disclosures }: DisclaimerFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const items = disclosures && disclosures.length > 0 ? disclosures : DEFAULT_DISCLOSURES;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 250);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-[4px] py-[4px] w-full cursor-pointer"
        aria-label="View regulatory information"
      >
        <Info className="size-[11px] text-[#999]" strokeWidth={1.5} />
        <span className="font-['DM_Sans',sans-serif] text-[0.625rem] text-[#999] tracking-[0.2px]">
          Regulatory info
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-[4px] py-[4px] w-full cursor-pointer"
        aria-label="View regulatory information"
      >
        <Info className="size-[11px] text-[#999]" strokeWidth={1.5} />
        <span className="font-['DM_Sans',sans-serif] text-[0.625rem] text-[#999] tracking-[0.2px]">
          Regulatory info
        </span>
      </button>

      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-250"
          style={{ opacity: isVisible ? 1 : 0 }}
          onClick={handleClose}
        />

        <div
          className="relative bg-[#faf9f6] rounded-t-[24px] w-full max-w-[430px] max-h-[60vh] overflow-hidden flex flex-col transition-transform duration-250 ease-out"
          style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}
        >
          <div className="flex items-center justify-between px-[20px] pt-[20px] pb-[12px]">
            <div className="flex items-center gap-[8px]">
              <Info className="size-[14px] text-[#992929]" strokeWidth={1.5} />
              <span className="font-['DM_Sans',sans-serif] font-semibold text-[0.625rem] text-[#992929] tracking-[0.8px] uppercase">
                Regulatory Disclaimer
              </span>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 size-[28px] flex items-center justify-center rounded-full hover:bg-[#efede6] transition-colors"
              aria-label="Close disclaimer"
            >
              <X className="size-[18px] text-[#555555]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="w-full h-px bg-[#e8e5de]" />

          <div className="overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[12px]">
            {items.map((text, i) => (
              <div key={i} className="flex gap-[8px]">
                <div className="mt-[6px] shrink-0 size-[4px] rounded-full bg-[#992929]/40" />
                <p className="font-['DM_Sans',sans-serif] text-[0.8125rem] text-[#555555] leading-[1.5]">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="px-[20px] pb-[20px] pt-[4px]">
            <p className="font-['DM_Sans',sans-serif] text-[0.6875rem] text-[#999] leading-[1.4] text-center">
              Emirates NBD is regulated by the Central Bank of the UAE and the Securities and Commodities Authority.
            </p>
          </div>

          <div className="w-full pb-safe" />
        </div>
      </div>
    </>
  );
}
