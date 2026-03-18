import React, { useState } from 'react';
import { TopBar, ChatHeader, Tag } from '../ada';
import {
  NotificationItem as NotificationItemComponent,
  NotificationType,
} from '../ada/NotificationItem';
import { useApi } from '../../hooks/useApi';
import type { AlertResponse, NotificationCategory } from '../../types';

interface NotificationsScreenProps {
  onChatHistoryClick?: () => void;
  onBack?: () => void;
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-[12px] px-[16px] py-[14px] w-full animate-pulse">
          <div className="flex gap-[12px]">
            <div className="w-[36px] h-[36px] bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps = {}) {
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data: apiAlerts, loading, error } = useApi<AlertResponse[]>('/api/notifications');

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
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[15px] pt-0 px-0 w-full z-10">
        <TopBar />
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

          {loading ? (
            <NotificationsSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center w-full py-[40px]">
              <div className="text-center">
                <p className="text-[#992929] text-[14px] font-['DM_Sans:SemiBold',sans-serif] mb-2">
                  Unable to load notifications
                </p>
                <p className="text-[#555555] text-[12px] font-['DM_Sans:Regular',sans-serif]">
                  {error}
                </p>
              </div>
            </div>
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
                  <p className="font-['DM_Sans:Medium',sans-serif] text-[#3a3a3a] text-[16px] mb-[8px]">
                    No notifications
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] text-[#667085] text-[14px] leading-[20px]">
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
