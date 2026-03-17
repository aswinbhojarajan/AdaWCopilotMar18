import React, { useState, useEffect, useRef } from 'react';
import { TopBar, ChatHeader, ChatMessage, SuggestedQuestion, BottomBar, AtomIcon } from '../ada';
import type { Message, ChatContext } from '../../types';

interface ChatScreenProps {
  initialMessage?: string;
  chatContext?: ChatContext;
  onBack?: () => void;
  onChatHistoryClick?: () => void;
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
}

async function fetchChatResponse(
  message: string,
  context?: ChatContext,
): Promise<{ message: string; suggestedQuestions: string[] }> {
  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: context
          ? {
              category: context.category,
              categoryType: context.categoryType,
              title: context.title,
              sourceScreen: context.sourceScreen,
            }
          : undefined,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      message: data.message.message,
      suggestedQuestions: data.suggestedQuestions ?? [],
    };
  } catch {
    return {
      message: "I'm having trouble connecting right now. Please try again in a moment.",
      suggestedQuestions: ['Try again'],
    };
  }
}

export function ChatScreen({
  initialMessage,
  chatContext,
  onBack,
  onChatHistoryClick,
  messages: externalMessages = [],
  setMessages: externalSetMessages,
}: ChatScreenProps = {}) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messages = externalSetMessages ? externalMessages : localMessages;
  const setMessages = externalSetMessages || setLocalMessages;

  const [isTyping, setIsTyping] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendAndReceive = async (userMessage: string, context?: ChatContext) => {
    setIsTyping(true);
    const response = await fetchChatResponse(userMessage, context);
    const adaMsg: Message = {
      id: (Date.now() + 1).toString(),
      message: response.message,
      sender: 'assistant',
    };
    setMessages((prev) => [...prev, adaMsg]);
    setApiSuggestions(response.suggestedQuestions);
    setIsTyping(false);
  };

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
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
          setMessages((prev) => [...prev, adaMsg]);
          setIsTyping(false);
        }, 1500);
      } else {
        sendAndReceive(initialMessage, chatContext);
      }
    } else if (
      initialMessage &&
      messages.length > 0 &&
      messages[messages.length - 1].sender === 'user' &&
      messages[messages.length - 1].message === initialMessage
    ) {
      const hasResponse =
        messages.length > 1 && messages[messages.length - 1].sender === 'assistant';
      if (!hasResponse) {
        if (chatContext?.adaResponse) {
          setIsTyping(true);
          setTimeout(() => {
            const adaMsg: Message = {
              id: (Date.now() + 1).toString(),
              message: chatContext.adaResponse!,
              sender: 'assistant',
            };
            setMessages((prev) => [...prev, adaMsg]);
            setIsTyping(false);
          }, 1500);
        } else {
          sendAndReceive(initialMessage, chatContext);
        }
      }
    }
  }, [initialMessage]);

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      message: value,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    sendAndReceive(value);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(question);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('Back to previous screen');
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

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === 'assistant') {
      if (lastMessage.message.includes('rate expectations')) {
        return ['Why does this affect my portfolio?', 'How much of my portfolio is exposed?'];
      }
      if (lastMessage.message.includes('rebalancing')) {
        return ['Yes, show me scenarios', 'What are the risks?'];
      }
      if (lastMessage.message.includes('off track')) {
        return ['Show me recovery options', 'How much more do I need monthly?'];
      }
    }

    return ['Tell me more', 'Show me the numbers'];
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] pt-0 px-0 w-full z-10">
        <TopBar />
        <ChatHeader onBack={handleBack} />
      </div>

      <div className="absolute top-[88px] left-0 right-0 bottom-[196px] overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] py-[12px] w-full pb-[20px]">
          {messages.length > 0 && (
            <>
              <div className="w-full flex items-center justify-center mb-[12px] mt-[16px]">
                <div className="bg-white/60 rounded-full px-[16px] py-[6px] border border-[#e3e3e3]">
                  <p className="font-['DM_Sans:Light',sans-serif] text-[#555555] text-[11px] tracking-[-0.22px] text-center">
                    Today
                  </p>
                </div>
              </div>

              <div className="w-full flex items-center justify-center mb-[16px]">
                <div className="max-w-[90%]">
                  <p className="font-['DM_Sans:Light',sans-serif] text-[#555555] text-[12px] tracking-[-0.24px] text-center leading-[1.5] opacity-70">
                    I can analyze your portfolio, model risk scenarios, explore investment
                    opportunities, and provide personalized guidance.
                  </p>
                </div>
              </div>

              <div className="bg-[#efede6] relative rounded-[30px] shrink-0 w-full">
                <div className="size-full">
                  <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
                    <div className="content-stretch flex flex-col gap-[8px] items-end relative shrink-0 w-full">
                      {messages.map((msg, index) => (
                        <React.Fragment key={msg.id}>
                          <ChatMessage
                            message={msg.message}
                            sender={msg.sender}
                            simulator={msg.simulator}
                            contextPrefix={
                              index === 0 && msg.sender === 'user' && chatContext
                                ? chatContext.title
                                : undefined
                            }
                          />
                        </React.Fragment>
                      ))}

                      {isTyping && (
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

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full pt-[40px] px-[24px]">
              <div className="mb-[16px]">
                <AtomIcon size={55} />
              </div>

              <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[24px] tracking-[-0.48px] text-center mb-[6px]">
                How can I help you today?
              </p>
              <p className="font-['DM_Sans:Light',sans-serif] text-[#555555] text-[14px] text-center opacity-70">
                Ask me anything about your portfolio,
                <br />
                investments, or market insights.
              </p>
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
          onChatHistoryClick={onChatHistoryClick || (() => console.log('Chat history'))}
          isOnChatScreen={true}
          hasActiveChatToday={messages.length > 0}
        />
      </div>
    </div>
  );
}
