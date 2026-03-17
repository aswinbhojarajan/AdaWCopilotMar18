import React from 'react';
import {
  Clock,
  AlertTriangle,
  Lightbulb,
  Calendar,
  FileText,
  TrendingUp,
  Bell,
} from 'lucide-react';

export type NotificationType =
  | 'PORTFOLIO_ALERT'
  | 'OPPORTUNITY'
  | 'EVENT'
  | 'DOCUMENT'
  | 'ADVISOR_MESSAGE'
  | 'MARKET_UPDATE'
  | 'SYSTEM';

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  unread?: boolean;
  onClick?: () => void;
}

const notificationConfig: Record<
  NotificationType,
  {
    accentColor: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    bgColor: string;
  }
> = {
  PORTFOLIO_ALERT: {
    accentColor: '#d97706',
    icon: AlertTriangle,
    bgColor: '#fef3c7',
  },
  OPPORTUNITY: {
    accentColor: '#059669',
    icon: Lightbulb,
    bgColor: '#d1fae5',
  },
  EVENT: {
    accentColor: '#441316',
    icon: Calendar,
    bgColor: '#fce7e8',
  },
  DOCUMENT: {
    accentColor: '#555555',
    icon: FileText,
    bgColor: '#e5e5e5',
  },
  ADVISOR_MESSAGE: {
    accentColor: '#441316',
    icon: Bell,
    bgColor: '#fce7e8',
  },
  MARKET_UPDATE: {
    accentColor: '#555555',
    icon: TrendingUp,
    bgColor: '#e5e5e5',
  },
  SYSTEM: {
    accentColor: '#555555',
    icon: Bell,
    bgColor: '#e5e5e5',
  },
};

export function NotificationItem({
  id: _id,
  type,
  title,
  message,
  timestamp,
  unread = false,
  onClick,
}: NotificationItemProps) {
  const config = notificationConfig[type];
  const _Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white content-stretch cursor-pointer flex flex-col gap-[12px] items-start px-[16px] py-[16px] relative rounded-[12px] shrink-0 w-full hover:bg-[#fafaf9] transition-colors"
    >
      {/* Title with Unread Indicator */}
      <div className="w-full flex items-center gap-[8px]">
        {unread && <div className="h-[8px] w-[8px] rounded-full bg-[#992929] shrink-0" />}
        <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[#3a3a3a] text-[18px] leading-[24px] flex-1">
          {title}
        </p>
      </div>

      {/* Message */}
      <div className="w-full" style={{ paddingLeft: unread ? '16px' : '0' }}>
        <p className="font-['DM_Sans:Regular',sans-serif] text-[#667085] text-[13px] leading-[18px]">
          {message}
        </p>
      </div>

      {/* Timestamp - Bottom Right */}
      <div className="flex items-center justify-end w-full gap-[4px]">
        <Clock className="h-[12px] w-[12px] text-[#98989d]" strokeWidth={2} />
        <p className="font-['DM_Sans:Regular',sans-serif] text-[#98989d] text-[11px] leading-[normal] whitespace-nowrap">
          {timestamp}
        </p>
      </div>
    </div>
  );
}
