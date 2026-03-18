import React, { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import svgPaths from '../../imports/svg-3k2bapmb30';

export interface SlideNotificationProps {
  variant?: 'system' | 'default';
  message: string;
  categoryLabel?: string;
  categoryLabelColor?: string;
  show: boolean;
  onDismiss: () => void;
  actionText?: string;
  onAction?: () => void;
  autoDismiss?: number;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

export function SlideNotification({
  variant = 'default',
  message,
  categoryLabel,
  categoryLabelColor = '#059669',
  show,
  onDismiss,
  actionText,
  onAction,
  autoDismiss,
  icon,
  backgroundColor,
  textColor = '#441316',
}: SlideNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Default colors based on variant
  const defaultBgColor = variant === 'system' ? '#dad1d2' : '#ffffff';
  const bgColor = backgroundColor || defaultBgColor;

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);

      if (autoDismiss) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            setIsVisible(false);
            onDismiss();
          }, 300);
        }, autoDismiss);
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoDismiss, onDismiss]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  if (!isVisible) return null;

  // System variant: compact alert banner with Ada branding
  if (variant === 'system') {
    return (
      <div
        className={`absolute top-[128px] left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div
          className="relative mx-[16px] rounded-[13.135px]"
          style={{
            backgroundColor: bgColor,
            boxShadow: '0px 0px 10.508px 0px rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-start gap-[10px] px-[13px] py-[11px] pr-[40px]">
            {/* Ada Atom Icon */}
            <div className="shrink-0 mt-[2px]">
              {icon || (
                <svg className="w-[19.703px] h-[19.703px]" viewBox="0 0 20 20" fill="none">
                  <path d={svgPaths.p3d650680} stroke="#441316" strokeWidth="0.84746" />
                  <path d={svgPaths.p6b70180} stroke="#441316" strokeWidth="0.84746" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-[12px] flex-1 min-w-0">
              {/* Category Label */}
              {categoryLabel && (
                <p
                  className="font-['DM_Sans:SemiBold',sans-serif] text-[10.209px] leading-[14.777px] tracking-[0.6567px] uppercase"
                  style={{ color: categoryLabelColor }}
                >
                  {categoryLabel}
                </p>
              )}

              {/* Message */}
              <p
                className="font-['DM_Sans:Regular',sans-serif] text-[12px] leading-[14.777px]"
                style={{ color: '#555555' }}
              >
                {message}
              </p>

              {/* Action Link */}
              {actionText && onAction && (
                <button
                  onClick={onAction}
                  className="font-['DM_Sans:SemiBold',sans-serif] text-[11px] leading-[13.545px] text-left transition-opacity hover:opacity-70"
                  style={{ color: '#555555' }}
                >
                  {actionText}
                </button>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-[11.49px] right-[13px] w-[16.419px] h-[16.419px] flex items-center justify-center transition-opacity hover:opacity-70"
              aria-label="Dismiss notification"
            >
              <X
                className="w-[11.493px] h-[11.493px]"
                style={{ color: '#555555' }}
                strokeWidth={1}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant: standard notification card
  return (
    <div
      className={`absolute top-[128px] left-[16px] right-[16px] z-50 transition-all duration-300 ease-out ${
        isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="relative rounded-[16px] shadow-lg" style={{ backgroundColor: bgColor }}>
        <div className="flex items-start gap-[12px] p-[16px] pr-[40px]">
          {/* Icon */}
          <div className="shrink-0 mt-[2px]">
            {icon || (
              <AlertTriangle
                className="w-[18px] h-[18px]"
                style={{ color: textColor }}
                strokeWidth={1.5}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[12px] flex-1 min-w-0">
            <p
              className="font-['DM_Sans:Regular',sans-serif] text-[13px] leading-[18px]"
              style={{ color: textColor }}
            >
              {message}
            </p>

            {/* Optional Action Button */}
            {actionText && onAction && (
              <button
                onClick={onAction}
                className="font-['DM_Sans:SemiBold',sans-serif] text-[11px] tracking-[0.8px] uppercase text-left transition-opacity hover:opacity-70"
                style={{ color: textColor }}
              >
                {actionText}
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-[14px] right-[14px] w-[20px] h-[20px] flex items-center justify-center transition-opacity hover:opacity-70"
            aria-label="Dismiss notification"
          >
            <X className="w-[14px] h-[14px]" style={{ color: textColor }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
