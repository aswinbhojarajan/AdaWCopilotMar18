import React, { useState } from 'react';
import { Navigation } from './components/ada';
import { HomeScreen } from './components/screens/HomeScreen';
import { HomeEmptyScreen } from './components/screens/HomeEmptyScreen';
import { DiscoverScreen } from './components/screens/DiscoverScreen';
import { LoungeScreen } from './components/screens/LoungeScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { ChatHistoryScreen } from './components/screens/ChatHistoryScreen';
import { WealthScreen } from './components/screens/WealthScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import ClientEnvironment from './imports/ClientEnvironment-2066-398';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  simulator?: {
    type: 'retirement' | 'investment' | 'spending' | 'tax';
    initialValues?: Record<string, number>;
  };
}

interface ChatContext {
  category: string;
  categoryType: string;
  title: string;
  sourceScreen?: string;
  adaResponse?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'wealth' | 'discover' | 'lounge'>('home');
  const [currentView, setCurrentView] = useState<'home' | 'home-empty' | 'chat' | 'chat-history' | 'notifications' | 'client-environment'>('client-environment');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatContext, setChatContext] = useState<ChatContext | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previousScreen, setPreviousScreen] = useState<{
    view: 'home' | 'home-empty' | 'chat' | 'chat-history' | 'notifications' | 'client-environment';
    tab: 'home' | 'wealth' | 'discover' | 'lounge';
  }>({ view: 'home', tab: 'home' });
  const hasActiveChatToday = messages.length > 0;

  // Poll voting state for notification trigger
  const [hasVotedInPoll, setHasVotedInPoll] = useState(false);
  const [showGoalNotification, setShowGoalNotification] = useState(false);
  const [pendingWealthScroll, setPendingWealthScroll] = useState(false);

  // Collapsible screens menu state
  const [screensExpanded, setScreensExpanded] = useState(true);

  // Track when user votes in poll
  const handlePollVote = () => {
    setHasVotedInPoll(true);
  };

  // Handle navigation to Wealth from Collective notification
  const handleNavigateToWealthFromCollective = () => {
    setActiveTab('wealth');
    setPendingWealthScroll(true);
  };

  // Show notification when navigating to Wealth after voting
  const handleTabChange = (newTab: 'home' | 'wealth' | 'discover' | 'lounge') => {
    setActiveTab(newTab);
    
    // DON'T show notification if already on wealth tab - it should only show from Collective
    // The notification will be shown via handleNavigateToWealthFromCollective instead
  };

  // Handle message submission from BottomBar
  const handleChatSubmit = (message: string, context?: ChatContext) => {
    // Store the current screen before navigating to chat
    setPreviousScreen({ view: currentView, tab: activeTab });
    setChatMessage(message);
    setChatContext(context);
    setCurrentView('chat');
    setMessages([...messages, { id: Date.now().toString(), message, sender: 'user' }]); // Add user message to chat history
  };

  // Handle resuming today's chat
  const handleResumeChat = () => {
    // Store the current screen before navigating to chat
    setPreviousScreen({ view: currentView, tab: activeTab });
    setCurrentView('chat');
  };

  // Handle opening empty chat screen when user clicks bar
  const handleOpenChat = () => {
    if (!hasActiveChatToday) {
      // Store the current screen before navigating to chat
      setPreviousScreen({ view: currentView, tab: activeTab });
      setChatMessage(''); // Clear any previous message
      setCurrentView('chat');
    }
  };

  // Function to demonstrate different views - you can wire this to actual routing
  const renderCurrentView = () => {
    if (currentView === 'home-empty') {
      return <HomeEmptyScreen onChatHistoryClick={() => setCurrentView('chat-history')} />;
    }
    if (currentView === 'chat') {
      return <ChatScreen 
        initialMessage={chatMessage}
        chatContext={chatContext}
        messages={messages}
        setMessages={setMessages}
        onChatHistoryClick={() => setCurrentView('chat-history')}
        onBack={() => {
          setChatMessage('');
          setChatContext(undefined);
          setCurrentView(previousScreen.view);
          setActiveTab(previousScreen.tab);
        }}
      />;
    }
    if (currentView === 'chat-history') {
      return <ChatHistoryScreen 
        onBack={() => { setCurrentView('home'); setActiveTab('home'); }}
        onThreadClick={(threadId) => {
          console.log('Opening thread:', threadId);
          setCurrentView('chat');
        }}
      />;
    }
    if (currentView === 'notifications') {
      return <NotificationsScreen 
        onBack={() => { setCurrentView('home'); setActiveTab('home'); }}
        onChatHistoryClick={() => setCurrentView('chat-history')}
      />;
    }
    if (currentView === 'client-environment') {
      return <ClientEnvironment onNavigateToAda={() => { setCurrentView('home'); setActiveTab('home'); }} />;
    }
    
    // Default tab-based navigation
    if (activeTab === 'home') return <HomeScreen onChatHistoryClick={() => setCurrentView('chat-history')} onNotificationsClick={() => setCurrentView('notifications')} onChatSubmit={handleChatSubmit} hasActiveChatToday={hasActiveChatToday} onResumeChat={handleResumeChat} onOpenChat={handleOpenChat} onClose={() => setCurrentView('client-environment')} />;
    if (activeTab === 'wealth') return (
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
    if (activeTab === 'discover') return <DiscoverScreen onChatHistoryClick={() => setCurrentView('chat-history')} onNotificationsClick={() => setCurrentView('notifications')} onChatSubmit={handleChatSubmit} hasActiveChatToday={hasActiveChatToday} onResumeChat={handleResumeChat} onOpenChat={handleOpenChat} onClose={() => setCurrentView('client-environment')} />;
    if (activeTab === 'lounge') return <LoungeScreen onChatHistoryClick={() => setCurrentView('chat-history')} onNotificationsClick={() => setCurrentView('notifications')} onChatSubmit={handleChatSubmit} hasActiveChatToday={hasActiveChatToday} onResumeChat={handleResumeChat} onOpenChat={handleOpenChat} onPollVote={handlePollVote} onNavigateToWealth={handleNavigateToWealthFromCollective} onClose={() => setCurrentView('client-environment')} />;

    // Placeholder for other tabs
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
      {/* Mobile Container */}
      <div className="relative w-full max-w-[430px] h-screen bg-[#efede6] shadow-2xl" style={{ isolation: 'isolate' } as React.CSSProperties}>
        {/* Navigation - only show on main tab views */}
        {!['chat', 'chat-history', 'home-empty', 'notifications', 'client-environment'].includes(currentView) && (
          <div className="absolute top-[88px] left-0 right-0 z-20">
            <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        )}

        {/* Screen Content */}
        <div className="relative w-full h-full">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}