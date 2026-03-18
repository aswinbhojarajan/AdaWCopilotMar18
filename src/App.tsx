import React, { useState, useCallback, Suspense, lazy, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HomeScreen } from './components/screens/HomeScreen';
import { TopBar, Header, Navigation, BottomBar } from './components/ada';
import type { TabType, ViewType, ChatContext, Message } from './types';

const HomeEmptyScreen = lazy(() => import('./components/screens/HomeEmptyScreen').then(m => ({ default: m.HomeEmptyScreen })));
const DiscoverScreen = lazy(() => import('./components/screens/DiscoverScreen').then(m => ({ default: m.DiscoverScreen })));
const CollectiveScreen = lazy(() => import('./components/screens/CollectiveScreen').then(m => ({ default: m.CollectiveScreen })));
const ChatScreen = lazy(() => import('./components/screens/ChatScreen').then(m => ({ default: m.ChatScreen })));
const ChatHistoryScreen = lazy(() => import('./components/screens/ChatHistoryScreen').then(m => ({ default: m.ChatHistoryScreen })));
const WealthScreen = lazy(() => import('./components/screens/WealthScreen').then(m => ({ default: m.WealthScreen })));
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen').then(m => ({ default: m.NotificationsScreen })));
const ClientEnvironment = lazy(() => import('./imports/ClientEnvironment-2066-398'));

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

  const isOverlay = ['chat', 'chat-history', 'notifications'].includes(currentView);
  const isClientEnv = currentView === 'client-environment';
  const isTabView = !isOverlay && !isClientEnv && currentView !== 'home-empty';

  const renderTabContent = () => {
    if (activeTab === 'home')
      return (
        <HomeScreen
          onChatSubmit={handleChatSubmit}
        />
      );
    if (activeTab === 'wealth')
      return (
        <WealthScreen
          onChatSubmit={handleChatSubmit}
          showGoalNotification={showGoalNotification}
          onDismissNotification={() => setShowGoalNotification(false)}
          shouldAutoScrollToGoal={pendingWealthScroll}
          onScrollComplete={() => setPendingWealthScroll(false)}
        />
      );
    if (activeTab === 'discover')
      return (
        <DiscoverScreen
          onChatSubmit={handleChatSubmit}
        />
      );
    if (activeTab === 'collective')
      return (
        <CollectiveScreen
          onChatSubmit={handleChatSubmit}
          onPollVote={handlePollVote}
          onNavigateToWealth={handleNavigateToWealthFromCollective}
        />
      );
    return null;
  };

  const renderFullScreenView = () => {
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
    return null;
  };

  const fullScreenKey = isOverlay ? currentView : isClientEnv ? 'client-environment' : currentView === 'home-empty' ? 'home-empty' : null;

  const getFullScreenVariants = () => {
    if (isOverlay) return overlayVariants;
    return fadeVariants;
  };

  const getFullScreenTransition = () => {
    if (isOverlay) return { type: 'tween' as const, duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] };
    return { duration: 0.4 };
  };

  return (
    <div className="relative w-full min-h-screen bg-[#999999] flex items-center justify-center overflow-hidden">
      <div
        className="relative w-full max-w-[430px] h-screen bg-[#efede6] shadow-2xl overflow-hidden"
        style={{ isolation: 'isolate' } as React.CSSProperties}
      >
        <Suspense fallback={<div className="flex items-center justify-center h-full bg-[#efede6]" />}>
          {isTabView && (
            <div className="relative h-full w-full">
              <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
                <TopBar />
                <Header
                  onNotificationsClick={() => navigateTo('notifications')}
                  onClose={() => navigateTo('client-environment')}
                />
                <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`tab-${activeTab}`}
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="absolute top-[128px] left-0 right-0 bottom-0"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 z-10">
                <BottomBar
                  onSubmit={handleChatSubmit}
                  onChatHistoryClick={() => navigateTo('chat-history')}
                  hasActiveChatToday={hasActiveChatToday}
                  onResumeChat={handleResumeChat}
                  onOpenChat={handleOpenChat}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {fullScreenKey && (
              <motion.div
                key={fullScreenKey}
                variants={getFullScreenVariants()}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={getFullScreenTransition()}
                className="absolute inset-0 z-20"
              >
                {renderFullScreenView()}
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}
