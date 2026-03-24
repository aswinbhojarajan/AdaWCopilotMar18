import React, { useState } from 'react';
import { ChatHeader, Tag } from '../ada';
import {
  NotificationItem as NotificationItemComponent,
  NotificationType,
} from '../ada/NotificationItem';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useNotifications } from '../../hooks/useNotifications';
import type { NotificationCategory } from '../../types';

interface NotificationsScreenProps {
  onChatHistoryClick?: () => void;
  onBack?: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps = {}) {
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data: apiAlerts, isLoading, isError, refetch } = useNotifications();

  const notifications = (apiAlerts ?? []).map((alert) => ({
    id: alert.id,
    type: alert.type as NotificationType,
    title: alert.title,
    message: alert.message,
    timestamp: alert.timestamp,
    unread: readIds.has(alert.id) ? false : alert.unread,
    category: alert.category,
  }));

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === 'all') return true;
    return notification.category === activeFilter;
  });

  const handleNotificationClick = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="bg-[#efede6] relative h-dvh w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[15px] pt-[16px] px-0 w-full z-10">
        <ChatHeader onBack={onBack} showNotifications={false} title="Notifications" />
      </div>

      <div className="absolute top-[101px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[16px] items-start px-[6px] pt-[16px] pb-[24px] w-full">
          <div className="relative shrink-0 w-full">
            <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-start justify-start px-[10px] py-[0px] relative w-full overflow-x-auto">
                <Tag active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
                  All
                </Tag>
                <Tag active={activeFilter === 'alerts'} onClick={() => setActiveFilter('alerts')}>
                  Alerts
                </Tag>
                <Tag
                  active={activeFilter === 'opportunities'}
                  onClick={() => setActiveFilter('opportunities')}
                >
                  Opportunities
                </Tag>
                <Tag active={activeFilter === 'updates'} onClick={() => setActiveFilter('updates')}>
                  Updates
                </Tag>
              </div>
            </div>
          </div>

          {isLoading ? (
            <SkeletonList count={5} />
          ) : isError ? (
            <ErrorBanner onRetry={() => refetch()} />
          ) : (
            <div className="flex flex-col gap-[8px] w-full">
              {filteredNotifications.map((notification) => (
                <NotificationItemComponent
                  key={notification.id}
                  id={notification.id}
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  timestamp={notification.timestamp}
                  unread={notification.unread}
                  onClick={() => handleNotificationClick(notification.id)}
                />
              ))}

              {filteredNotifications.length === 0 && (
                <div className="bg-white rounded-[12px] px-[24px] py-[48px] text-center w-full">
                  <p className="font-['DM_Sans',sans-serif] font-medium text-[#3a3a3a] text-[1rem] mb-[8px]">
                    No notifications
                  </p>
                  <p className="font-['DM_Sans',sans-serif] text-[#667085] text-[0.875rem] leading-[20px]">
                    You're all caught up! Check back later for new updates.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
