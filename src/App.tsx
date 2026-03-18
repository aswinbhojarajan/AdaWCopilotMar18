import React, { useState, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

const TAB_ORDER: TabType[] = ['home', 'wealth', 'discover', 'collective'];

const overlayVariants = {
  initial: { y: '100%', opacity: 1 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 1 },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

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

  const prevTabRef = useRef<TabType>('home');

  const handlePollVote = () => {
    setHasVotedInPoll(true);
  };

  const handleNavigateToWealthFromCollective = () => {
    setActiveTab('wealth');
    setPendingWealthScroll(true);
  };

  const handleTabChange = (newTab: TabType) => {
    prevTabRef.current = activeTab;
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

  const tabDirection = useMemo(() => {
    const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
    const curIdx = TAB_ORDER.indexOf(activeTab);
    return curIdx >= prevIdx ? 1 : -1;
  }, [activeTab]);

  const tabVariants = useMemo(() => ({
    initial: { x: `${tabDirection * 30}%`, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: `${-tabDirection * 30}%`, opacity: 0 },
  }), [tabDirection]);

  const isOverlay = ['chat', 'chat-history', 'notifications'].includes(currentView);
  const isClientEnv = currentView === 'client-environment';

  const screenKey = isOverlay || isClientEnv || currentView === 'home-empty'
    ? currentView
    : `tab-${activeTab}`;

  const getVariants = () => {
    if (isOverlay) return overlayVariants;
    if (isClientEnv) return fadeVariants;
    return tabVariants;
  };

  const getTransition = () => {
    if (isOverlay) return { type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] };
    if (isClientEnv) return { duration: 0.4 };
    return { type: 'tween', duration: 0.2, ease: 'easeInOut' };
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
          onThreadIdChange={setActiveThreadId}
          onChatHistoryClick={() => setCurrentView('chat-history')}
          onBack={() => {
            if (activeThreadId) {
              fetch(`/api/chat/${activeThreadId}/close`, { method: 'POST' }).catch(() => {});
            }
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
          onTabChange={handleTabChange}
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
          onTabChange={handleTabChange}
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
          onTabChange={handleTabChange}
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
          onTabChange={handleTabChange}
        />
      );

    return null;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#999999] flex items-center justify-center overflow-hidden">
      <div
        className="relative w-full max-w-[430px] h-screen bg-[#efede6] shadow-2xl overflow-hidden"
        style={{ isolation: 'isolate' } as React.CSSProperties}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={getTransition()}
            className="relative w-full h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
