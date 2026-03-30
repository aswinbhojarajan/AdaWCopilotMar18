import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader, ChatMessage, SuggestedQuestion, BottomBar, AtomIcon, ThinkingPanel, LiveThinkingBar } from '../ada';
import type { Message, ChatContext, ChatWidget } from '../../types';
import { getStreamHeaders } from '../../hooks/api';
import { useUser } from '../../contexts/UserContext';

interface ThinkingStep {
  step: string;
  detail: string;
  timestamp: number;
}

interface ChatScreenProps {
  initialMessage?: string;
  chatContext?: ChatContext;
  onBack?: () => void;
  onChatHistoryClick?: () => void;
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  existingThreadId?: string;
  onThreadIdChange?: (threadId: string) => void;
}

function useStreamingChat() {
  const abortRef = useRef<AbortController | null>(null);

  const streamMessage = useCallback(async (
    message: string,
    context: ChatContext | undefined,
    threadId: string | undefined,
    verbose: boolean,
    onText: (text: string) => void,
    onWidget: (widget: ChatWidget) => void,
    onSimulator: (sim: { type: string; initialValues?: Record<string, number> }) => void,
    onSuggestions: (questions: string[]) => void,
    onThinking: (step: ThinkingStep) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: getStreamHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          message,
          threadId,
          verbose,
          context: context ? {
            category: context.category,
            categoryType: context.categoryType,
            title: context.title,
            sourceScreen: context.sourceScreen,
            discoverCard: context.discoverCard,
          } : undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401) {
          const { handleFetchResponse } = await import('../../lib/ApiError');
          handleFetchResponse(res);
        }
        onError("I'm having trouble connecting. Please try again.");
        onDone();
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onError("I'm having trouble connecting. Please try again.");
        onDone();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            switch (event.type) {
              case 'text':
                if (event.content) onText(event.content);
                break;
              case 'widget':
                if (event.widget) onWidget(event.widget);
                break;
              case 'simulator':
                if (event.simulator) onSimulator(event.simulator);
                break;
              case 'suggested_questions':
                if (event.suggestedQuestions) onSuggestions(event.suggestedQuestions);
                break;
              case 'thinking':
                if (event.step) onThinking({ step: event.step, detail: event.detail || '', timestamp: Date.now() });
                break;
              case 'error':
                onError(event.content || 'Something went wrong.');
                break;
              case 'done':
                onDone();
                return;
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      onDone();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onError("I'm having trouble connecting. Please try again.");
        onDone();
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { streamMessage, cancel };
}

export function ChatScreen({
  initialMessage,
  chatContext,
  onBack,
  onChatHistoryClick,
  messages: externalMessages = [],
  setMessages: externalSetMessages,
  existingThreadId,
  onThreadIdChange,
}: ChatScreenProps = {}) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messages = externalSetMessages ? externalMessages : localMessages;
  const setMessages = externalSetMessages || setLocalMessages;

  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [verbose, setVerbose] = useState(() => {
    try { return localStorage.getItem('ada-verbose') === 'true'; } catch { return false; }
  });
  const [verboseModeAvailable, setVerboseModeAvailable] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadIdRef = useRef<string>(existingThreadId ?? `thread-${Date.now()}`);
  const { streamMessage } = useStreamingChat();

  const { userId: activeUserId } = useUser();

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) {
          import('../../lib/ApiError').then(m => m.handleFetchResponse(r));
          return null;
        }
        return r.json();
      })
      .then(data => setVerboseModeAvailable(data?.capabilities?.verbose_mode === true))
      .catch(() => setVerboseModeAvailable(false));
  }, [activeUserId]);

  const toggleVerbose = useCallback(() => {
    setVerbose(prev => {
      const next = !prev;
      try { localStorage.setItem('ada-verbose', String(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (onThreadIdChange) {
      onThreadIdChange(threadIdRef.current);
    }
  }, [onThreadIdChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendAndReceive = useCallback(async (userMessage: string, context?: ChatContext) => {
    setIsTyping(true);
    setThinkingSteps([]);

    const adaMsgId = (Date.now() + 1).toString();
    let currentText = '';
    const currentWidgets: ChatWidget[] = [];

    setMessages(prev => [...prev, {
      id: adaMsgId,
      message: '',
      sender: 'assistant',
      isStreaming: true,
    }]);

    await streamMessage(
      userMessage,
      context,
      threadIdRef.current,
      verbose,
      (text) => {
        currentText += text;
        setMessages(prev => prev.map(m =>
          m.id === adaMsgId ? { ...m, message: currentText } : m
        ));
      },
      (widget) => {
        currentWidgets.push(widget);
        setMessages(prev => prev.map(m =>
          m.id === adaMsgId ? { ...m, widgets: [...currentWidgets] } : m
        ));
      },
      (sim) => {
        setMessages(prev => prev.map(m =>
          m.id === adaMsgId ? {
            ...m,
            simulator: {
              type: sim.type as 'retirement' | 'investment' | 'spending' | 'tax',
              initialValues: sim.initialValues,
            },
          } : m
        ));
      },
      (questions) => {
        setApiSuggestions(questions);
      },
      (step) => {
        setThinkingSteps(prev => [...prev, step]);
      },
      () => {
        setMessages(prev => prev.map(m =>
          m.id === adaMsgId ? { ...m, isStreaming: false } : m
        ));
        setIsTyping(false);
      },
      (errorMsg) => {
        currentText = errorMsg;
        setMessages(prev => prev.map(m =>
          m.id === adaMsgId ? { ...m, message: errorMsg, isStreaming: false } : m
        ));
        setIsTyping(false);
      },
    );
  }, [setMessages, streamMessage, verbose]);

  useEffect(() => {
    if (existingThreadId && messages.length === 0) {
      setIsLoadingThread(true);
      fetch(`/api/chat/${existingThreadId}/messages`, { headers: getStreamHeaders(), credentials: 'include' })
        .then(res => {
          if (res.status === 401) {
            import('../../lib/ApiError').then(m => m.handleFetchResponse(res));
            throw new Error('Session expired');
          }
          return res.json();
        })
        .then((data: Array<{ id: string; sender: string; message: string; widgets?: ChatWidget[] }>) => {
          const loaded: Message[] = data.map(m => ({
            id: m.id,
            message: m.message,
            sender: m.sender as 'user' | 'assistant',
            widgets: m.widgets as ChatWidget[] | undefined,
          }));
          setMessages(loaded);
          setIsLoadingThread(false);
        })
        .catch(() => {
          setIsLoadingThread(false);
        });
      return;
    }

    if (initialMessage && messages.length === 0 && !existingThreadId) {
      const userMsg: Message = {
        id: Date.now().toString(),
        message: initialMessage,
        sender: 'user',
      };
      setMessages([userMsg]);

      if (chatContext?.adaResponse) {
        setIsTyping(true);
        setTimeout(() => {
          const adaMsg: Message = {
            id: (Date.now() + 1).toString(),
            message: chatContext.adaResponse!,
            sender: 'assistant',
          };
          setMessages(prev => [...prev, adaMsg]);
          setIsTyping(false);
        }, 1500);
      } else {
        sendAndReceive(initialMessage, chatContext);
      }
    }
  }, [initialMessage, existingThreadId]);

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      message: value,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMsg]);
    sendAndReceive(value);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(question);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const getSuggestedQuestions = (): string[] => {
    if (apiSuggestions.length > 0) return apiSuggestions;

    if (messages.length === 0) {
      return [
        'Review my tech allocation',
        'Show me bond opportunities',
        "What's my portfolio risk?",
      ];
    }

    return ['Tell me more', 'Show me the numbers'];
  };

  return (
    <div className="bg-[#efede6] relative h-dvh w-full overflow-hidden">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] px-0 w-full z-10 pt-safe">
        <div className="relative w-full">
          <ChatHeader onBack={handleBack} />
          {verboseModeAvailable && (
            <button
              onClick={toggleVerbose}
              className={`absolute right-[16px] top-1/2 -translate-y-1/2 flex items-center gap-[4px] px-[8px] py-[4px] rounded-full text-[0.625rem] font-['DM_Sans',sans-serif] tracking-[-0.2px] transition-colors z-20 ${
                verbose
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-[#f0ede5] text-[#999] border border-[#e0ddd5]'
              }`}
              title={verbose ? 'Thinking mode on' : 'Thinking mode off'}
            >
              <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {verbose ? 'Thinking' : 'Think'}
            </button>
          )}
        </div>
      </div>

      {verbose && isTyping && thinkingSteps.length > 0 && (
        <div className="absolute top-[88px] left-0 right-0 z-[9]">
          <LiveThinkingBar
            steps={thinkingSteps}
            isStreaming={isTyping}
            visible={verbose && isTyping && thinkingSteps.length > 0}
          />
        </div>
      )}

      <div className={`absolute left-0 right-0 bottom-[196px] overflow-y-auto ${verbose && isTyping && thinkingSteps.length > 0 ? 'top-[128px]' : 'top-[88px]'}`}>
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] py-[12px] w-full pb-[20px]">
          {messages.length > 0 && (
            <>
              <div className="w-full flex items-center justify-center mb-[12px] mt-[16px]">
                <div className="bg-white/60 rounded-full px-[16px] py-[6px] border border-[#e3e3e3]">
                  <p className="font-['DM_Sans',sans-serif] font-light text-[#555555] text-[0.6875rem] tracking-[-0.22px] text-center">
                    Today
                  </p>
                </div>
              </div>

              <div className="w-full flex items-center justify-center mb-[16px]">
                <div className="max-w-[90%]">
                  <p className="font-['DM_Sans',sans-serif] font-light text-[#555555] text-[0.75rem] tracking-[-0.24px] text-center leading-[1.5] opacity-70">
                    I can analyze your portfolio, model risk scenarios, explore investment
                    opportunities, and provide personalized guidance.
                  </p>
                </div>
              </div>

              <div className="bg-[#efede6] relative rounded-[30px] shrink-0 w-full">
                <div className="size-full">
                  <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
                    <div className="content-stretch flex flex-col gap-[8px] items-end relative shrink-0 w-full">
                      {messages.map((msg, index) => {
                        const isLastAssistant = msg.sender === 'assistant' && index === messages.length - 1;
                        const showThinkingBeforeAssistant = verbose && thinkingSteps.length > 0 && isLastAssistant && !isTyping;
                        return (
                          <React.Fragment key={msg.id}>
                            {showThinkingBeforeAssistant && (
                              <ThinkingPanel steps={thinkingSteps} isStreaming={isTyping} />
                            )}
                            <ChatMessage
                              message={msg.message}
                              sender={msg.sender}
                              simulator={msg.simulator}
                              widgets={msg.widgets}
                              isStreaming={msg.isStreaming}
                              contextPrefix={
                                index === 0 && msg.sender === 'user' && chatContext
                                  ? chatContext.title
                                  : undefined
                              }
                            />
                          </React.Fragment>
                        );
                      })}

                      {isTyping && messages[messages.length - 1]?.sender !== 'assistant' && (
                        <div className="self-start max-w-[85%]">
                          <div className="bg-white rounded-[16px] px-[16px] py-[12px]">
                            <div className="flex gap-[4px] items-center">
                              <div
                                className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <div
                                className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <div
                                className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {messages.length === 0 && !isLoadingThread && (
            <div className="flex flex-col items-center justify-center w-full pt-[40px] px-[24px]">
              <div className="mb-[16px]">
                <AtomIcon size={55} />
              </div>

              <p className="font-['Crimson_Pro',sans-serif] text-[#555555] text-[1.5rem] tracking-[-0.48px] text-center mb-[6px]">
                How can I help you today?
              </p>
              <p className="font-['DM_Sans',sans-serif] font-light text-[#555555] text-[0.875rem] text-center opacity-70">
                Ask me anything about your portfolio,
                <br />
                investments, or market insights.
              </p>
            </div>
          )}

          {isLoadingThread && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full pt-[60px]">
              <div className="flex gap-[4px] items-center">
                <div className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="font-['DM_Sans',sans-serif] font-light text-[#555555] text-[0.75rem] mt-[12px]">Loading conversation...</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        {!isTyping && (
          <div className="content-stretch flex flex-col items-center w-full bg-[#efede6] pb-[8px]">
            <div className="relative shrink-0 w-full">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[10px] items-center pb-[8px] pt-0 px-[16px] relative w-full overflow-x-auto scrollbar-hide">
                  {getSuggestedQuestions().map((question, index) => (
                    <SuggestedQuestion
                      key={index}
                      question={question}
                      onClick={() => handleSuggestedQuestion(question)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <BottomBar
          onSubmit={handleSubmit}
          onChatHistoryClick={onChatHistoryClick || (() => {})}
          isOnChatScreen={true}
          hasActiveChatToday={messages.length > 0}
        />
      </div>
    </div>
  );
}
