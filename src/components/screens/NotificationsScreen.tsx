import React, { useState } from 'react';
import { TopBar, ChatHeader, Tag } from '../ada';
import { NotificationItem, NotificationType } from '../ada/NotificationItem';

interface NotificationsScreenProps {
  onChatHistoryClick?: () => void;
  onBack?: () => void;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  category: 'all' | 'alerts' | 'opportunities' | 'updates';
}

const notificationsData: Notification[] = [
  {
    id: '1',
    type: 'PORTFOLIO_ALERT',
    title: 'Stock allocation reached 55% of portfolio',
    message: 'Your equity holdings now represent 55% of your portfolio, above your peers\' average of 45%. This positions you for growth while accepting higher near-term volatility.',
    timestamp: '12 min ago',
    unread: true,
    category: 'alerts'
  },
  {
    id: '3',
    type: 'ADVISOR_MESSAGE',
    title: 'Message from your advisor',
    message: 'Hi Abdullah, I\'ve reviewed your Q4 performance. Let\'s schedule a call to discuss rebalancing strategies for the new year. —Khalid',
    timestamp: '2 hours ago',
    unread: true,
    category: 'updates'
  },
  {
    id: '4',
    type: 'MARKET_UPDATE',
    title: 'Federal Reserve signals pause on rate cuts',
    message: 'The Fed maintained its cautious stance, keeping rates unchanged through Q2 2026. This may impact your 15% bond allocation and 20% cash position.',
    timestamp: '6 hours ago',
    unread: false,
    category: 'updates'
  },
  {
    id: '5',
    type: 'DOCUMENT',
    title: 'Q4 2025 Portfolio Report ready',
    message: 'Your quarterly performance report is now available. Portfolio value: $94,830.19, up 2.1% this week. Review your returns, asset allocation, and personalized recommendations.',
    timestamp: '8 hours ago',
    unread: false,
    category: 'updates'
  },
  {
    id: '6',
    type: 'OPPORTUNITY',
    title: 'Emerging market bonds offer 6.8% yields',
    message: 'High-quality sovereign debt in stable economies now offers attractive income. Your current 15% bond allocation could benefit from diversification into higher-yielding instruments.',
    timestamp: 'Yesterday',
    unread: false,
    category: 'opportunities'
  },
  {
    id: '7',
    type: 'PORTFOLIO_ALERT',
    title: 'Portfolio up $758 today on equity gains',
    message: 'Your portfolio gained $758.64 (+0.8%) today, driven primarily by your 55% stock allocation. Year-to-date performance continues to track above peer benchmarks.',
    timestamp: 'Yesterday',
    unread: false,
    category: 'alerts'
  },
  {
    id: '8',
    type: 'EVENT',
    title: 'Reminder: Estate planning consultation',
    message: 'Your scheduled consultation with our estate planning specialist is tomorrow at 2:00 PM. Meeting link sent to your email.',
    timestamp: '2 days ago',
    unread: false,
    category: 'updates'
  }
];

type FilterType = 'all' | 'alerts' | 'opportunities' | 'updates';

export function NotificationsScreen({ onChatHistoryClick, onBack }: NotificationsScreenProps = {}) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    return notification.category === activeFilter;
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.unread).length;

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Handle notification click
  const handleNotificationClick = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
    // Here you would typically navigate to the relevant screen or show a detail modal
    console.log('Notification clicked:', id);
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      {/* Fixed Header - includes TopBar, Ada Logo, and Navigation */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[15px] pt-0 px-0 w-full z-10">
        <TopBar />
        <ChatHeader onBack={onBack} showNotifications={false} title="Notifications" />
      </div>

      {/* Scrollable Content - starts after header */}
      <div className="absolute top-[101px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[16px] items-start px-[6px] pt-[16px] pb-[24px] w-full">
          
          {/* Filter Tags */}
          <div className="relative shrink-0 w-full">
            <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-start justify-start px-[10px] py-[0px] relative w-full overflow-x-auto">
                <Tag 
                  active={activeFilter === 'all'} 
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </Tag>
                <Tag 
                  active={activeFilter === 'alerts'} 
                  onClick={() => setActiveFilter('alerts')}
                >
                  Alerts
                </Tag>
                <Tag 
                  active={activeFilter === 'opportunities'} 
                  onClick={() => setActiveFilter('opportunities')}
                >
                  Opportunities
                </Tag>
                <Tag 
                  active={activeFilter === 'updates'} 
                  onClick={() => setActiveFilter('updates')}
                >
                  Updates
                </Tag>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex flex-col gap-[8px] w-full">
            {filteredNotifications.map((notification) => (
              <NotificationItem
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

            {/* Empty State */}
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
        </div>
      </div>
    </div>
  );
}