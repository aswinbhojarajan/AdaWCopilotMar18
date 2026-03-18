import React, { useState, useCallback } from 'react';
import { Navigation } from './components/ada';
import { HomeScreen } from './components/screens/HomeScreen';
import { HomeEmptyScreen } from './components/screens/HomeEmptyScreen';
import { DiscoverScreen } from './components/screens/DiscoverScreen';
import { CollectiveScreen } from './components/screens/CollectiveScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { ChatHistoryScreen } from './components/screens/ChatHistoryScreen';
import { WealthScreen } from './components/screens/WealthScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import ClientEnvironment from './imports/ClientEnvironment-2066-398';
import type { TabType, ViewType, ChatContext, Message } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentView, setCurrentView] = useState<ViewType>('client-environment');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatContext, setChatContext] = useState<ChatContext | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const [previousScreen, setPreviousScreen] = useState<{
    view: ViewType;
    tab: TabType;
  }>({ view: 'home', tab: 'home' });
  const hasActiveChatToday = messages.length > 0;

  const [_hasVotedInPoll, setHasVotedInPoll] = useState(false);
  const [showGoalNotification, setShowGoalNotification] = useState(false);
  const [pendingWealthScroll, setPendingWealthScroll] = useState(false);
  const [_screensExpanded, _setScreensExpanded] = useState(true);

  const handlePollVote = () => {
    setHasVotedInPoll(true);
  };

  const handleNavigateToWealthFromCollective = () => {
    setActiveTab('wealth');
    setPendingWealthScroll(true);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
  };

  const handleChatSubmit = useCallback((message: string, context?: ChatContext) => {
    setPreviousScreen({ view: currentView, tab: activeTab });
    setChatMessage(message);
    setChatContext(context);
    setActiveThreadId(undefined);
    setMessages([]);
    setCurrentView('chat');
  }, [currentView, activeTab]);

  const handleResumeChat = () => {
    setPreviousScreen({ view: currentView, tab: activeTab });
    setCurrentView('chat');
  };

  const handleOpenChat = () => {
    if (!hasActiveChatToday) {
      setPreviousScreen({ view: currentView, tab: activeTab });
      setChatMessage('');
      setChatContext(undefined);
      setActiveThreadId(undefined);
      setMessages([]);
      setCurrentView('chat');
    }
  };

  const renderCurrentView = () => {
    if (currentView === 'home-empty') {
      return <HomeEmptyScreen onChatHistoryClick={() => setCurrentView('chat-history')} />;
    }
    if (currentView === 'chat') {
      return (
        <ChatScreen
          initialMessage={chatMessage}
          chatContext={chatContext}
          messages={messages}
          setMessages={setMessages}
          existingThreadId={activeThreadId}
          onChatHistoryClick={() => setCurrentView('chat-history')}
          onBack={() => {
            setChatMessage('');
            setChatContext(undefined);
            setCurrentView(previousScreen.view);
            setActiveTab(previousScreen.tab);
          }}
        />
      );
    }
    if (currentView === 'chat-history') {
      return (
        <ChatHistoryScreen
          onBack={() => {
            setCurrentView('home');
            setActiveTab('home');
          }}
          onThreadClick={(threadId) => {
            setPreviousScreen({ view: 'chat-history', tab: activeTab });
            setActiveThreadId(threadId);
            setChatMessage('');
            setChatContext(undefined);
            setMessages([]);
            setCurrentView('chat');
          }}
        />
      );
    }
    if (currentView === 'notifications') {
      return (
        <NotificationsScreen
          onBack={() => {
            setCurrentView('home');
            setActiveTab('home');
          }}
          onChatHistoryClick={() => setCurrentView('chat-history')}
        />
      );
    }
    if (currentView === 'client-environment') {
      return (
        <ClientEnvironment
          onNavigateToAda={() => {
            setCurrentView('home');
            setActiveTab('home');
          }}
        />
      );
    }

    if (activeTab === 'home')
      return (
        <HomeScreen
          onChatHistoryClick={() => setCurrentView('chat-history')}
          onNotificationsClick={() => setCurrentView('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          onClose={() => setCurrentView('client-environment')}
        />
      );
    if (activeTab === 'wealth')
      return (
        <WealthScreen
          onChatHistoryClick={() => setCurrentView('chat-history')}
          onNotificationsClick={() => setCurrentView('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          showGoalNotification={showGoalNotification}
          onDismissNotification={() => setShowGoalNotification(false)}
          shouldAutoScrollToGoal={pendingWealthScroll}
          onScrollComplete={() => setPendingWealthScroll(false)}
          onClose={() => setCurrentView('client-environment')}
        />
      );
    if (activeTab === 'discover')
      return (
        <DiscoverScreen
          onChatHistoryClick={() => setCurrentView('chat-history')}
          onNotificationsClick={() => setCurrentView('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          onClose={() => setCurrentView('client-environment')}
        />
      );
    if (activeTab === 'collective')
      return (
        <CollectiveScreen
          onChatHistoryClick={() => setCurrentView('chat-history')}
          onNotificationsClick={() => setCurrentView('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          onPollVote={handlePollVote}
          onNavigateToWealth={handleNavigateToWealthFromCollective}
          onClose={() => setCurrentView('client-environment')}
        />
      );

    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white rounded-[30px] p-[32px] mx-[24px]">
          <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] tracking-[-0.48px] text-center">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} screen coming soon...
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-[#999999] flex items-center justify-center overflow-hidden">
      <div
        className="relative w-full max-w-[430px] h-screen bg-[#efede6] shadow-2xl"
        style={{ isolation: 'isolate' } as React.CSSProperties}
      >
        {!['chat', 'chat-history', 'home-empty', 'notifications', 'client-environment'].includes(
          currentView,
        ) && (
          <div className="absolute top-[88px] left-0 right-0 z-20">
            <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        )}

        <div className="relative w-full h-full">{renderCurrentView()}</div>
      </div>
    </div>
  );
}
