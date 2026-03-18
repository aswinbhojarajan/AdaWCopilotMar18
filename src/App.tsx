import React, { useState, useCallback, useRef, useMemo, Suspense, lazy, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HomeScreen } from './components/screens/HomeScreen';
import type { TabType, ViewType, ChatContext, Message } from './types';

const HomeEmptyScreen = lazy(() => import('./components/screens/HomeEmptyScreen').then(m => ({ default: m.HomeEmptyScreen })));
const DiscoverScreen = lazy(() => import('./components/screens/DiscoverScreen').then(m => ({ default: m.DiscoverScreen })));
const CollectiveScreen = lazy(() => import('./components/screens/CollectiveScreen').then(m => ({ default: m.CollectiveScreen })));
const ChatScreen = lazy(() => import('./components/screens/ChatScreen').then(m => ({ default: m.ChatScreen })));
const ChatHistoryScreen = lazy(() => import('./components/screens/ChatHistoryScreen').then(m => ({ default: m.ChatHistoryScreen })));
const WealthScreen = lazy(() => import('./components/screens/WealthScreen').then(m => ({ default: m.WealthScreen })));
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen').then(m => ({ default: m.NotificationsScreen })));
const ClientEnvironment = lazy(() => import('./imports/ClientEnvironment-2066-398'));

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
  const [, startTransition] = useTransition();

  const navigateTo = useCallback((view: ViewType, tab?: TabType) => {
    startTransition(() => {
      setCurrentView(view);
      if (tab !== undefined) setActiveTab(tab);
    });
  }, [startTransition]);

  const handlePollVote = () => {
    setHasVotedInPoll(true);
  };

  const handleNavigateToWealthFromCollective = () => {
    startTransition(() => {
      setActiveTab('wealth');
      setPendingWealthScroll(true);
    });
  };

  const handleTabChange = (newTab: TabType) => {
    prevTabRef.current = activeTab;
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

  const handleChatSubmit = useCallback((message: string, context?: ChatContext) => {
    setPreviousScreen({ view: currentView, tab: activeTab });
    setChatMessage(message);
    setChatContext(context);
    setActiveThreadId(undefined);
    setMessages([]);
    navigateTo('chat');
  }, [currentView, activeTab, navigateTo]);

  const handleResumeChat = () => {
    setPreviousScreen({ view: currentView, tab: activeTab });
    navigateTo('chat');
  };

  const handleOpenChat = () => {
    if (!hasActiveChatToday) {
      setPreviousScreen({ view: currentView, tab: activeTab });
      setChatMessage('');
      setChatContext(undefined);
      setActiveThreadId(undefined);
      setMessages([]);
      navigateTo('chat');
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
      return <HomeEmptyScreen onChatHistoryClick={() => navigateTo('chat-history')} />;
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
          onChatHistoryClick={() => navigateTo('chat-history')}
          onBack={() => {
            if (activeThreadId) {
              fetch(`/api/chat/${activeThreadId}/close`, { method: 'POST' }).catch(() => {});
            }
            setChatMessage('');
            setChatContext(undefined);
            navigateTo(previousScreen.view, previousScreen.tab);
          }}
        />
      );
    }
    if (currentView === 'chat-history') {
      return (
        <ChatHistoryScreen
          onBack={() => navigateTo('home', 'home')}
          onThreadClick={(threadId) => {
            setPreviousScreen({ view: 'chat-history', tab: activeTab });
            setActiveThreadId(threadId);
            setChatMessage('');
            setChatContext(undefined);
            setMessages([]);
            navigateTo('chat');
          }}
        />
      );
    }
    if (currentView === 'notifications') {
      return (
        <NotificationsScreen
          onBack={() => navigateTo('home', 'home')}
          onChatHistoryClick={() => navigateTo('chat-history')}
        />
      );
    }
    if (currentView === 'client-environment') {
      return (
        <ClientEnvironment
          onNavigateToAda={() => navigateTo('home', 'home')}
        />
      );
    }

    if (activeTab === 'home')
      return (
        <HomeScreen
          onChatHistoryClick={() => navigateTo('chat-history')}
          onNotificationsClick={() => navigateTo('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          onClose={() => navigateTo('client-environment')}
          onTabChange={handleTabChange}
        />
      );
    if (activeTab === 'wealth')
      return (
        <WealthScreen
          onChatHistoryClick={() => navigateTo('chat-history')}
          onNotificationsClick={() => navigateTo('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          showGoalNotification={showGoalNotification}
          onDismissNotification={() => setShowGoalNotification(false)}
          shouldAutoScrollToGoal={pendingWealthScroll}
          onScrollComplete={() => setPendingWealthScroll(false)}
          onClose={() => navigateTo('client-environment')}
          onTabChange={handleTabChange}
        />
      );
    if (activeTab === 'discover')
      return (
        <DiscoverScreen
          onChatHistoryClick={() => navigateTo('chat-history')}
          onNotificationsClick={() => navigateTo('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          onClose={() => navigateTo('client-environment')}
          onTabChange={handleTabChange}
        />
      );
    if (activeTab === 'collective')
      return (
        <CollectiveScreen
          onChatHistoryClick={() => navigateTo('chat-history')}
          onNotificationsClick={() => navigateTo('notifications')}
          onChatSubmit={handleChatSubmit}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={handleResumeChat}
          onOpenChat={handleOpenChat}
          onPollVote={handlePollVote}
          onNavigateToWealth={handleNavigateToWealthFromCollective}
          onClose={() => navigateTo('client-environment')}
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
        <Suspense fallback={<div className="flex items-center justify-center h-full bg-[#efede6]" />}>
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
        </Suspense>
      </div>
    </div>
  );
}
