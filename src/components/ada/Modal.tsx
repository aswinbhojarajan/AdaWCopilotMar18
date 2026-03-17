import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[30px] w-full max-w-[400px] mx-[20px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="content-stretch flex flex-col gap-[8px] items-start px-[24px] pt-[24px] pb-[16px] border-b border-[#efede6]">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-[4px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] not-italic text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                {title}
              </p>
              {subtitle && (
                <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] tracking-[-0.48px]">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 size-[24px] flex items-center justify-center rounded-full hover:bg-[#efede6] transition-colors"
              aria-label="Close"
            >
              <X className="size-[20px] text-[#555555]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}