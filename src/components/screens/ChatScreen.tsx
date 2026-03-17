import React, { useState, useEffect, useRef } from 'react';
import { TopBar, ChatHeader, ChatMessage, SuggestedQuestion, BottomBar, AtomIcon } from '../ada';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  simulator?: {
    type: 'retirement' | 'investment' | 'spending' | 'tax';
    initialValues?: Record<string, number>;
  };
}

interface ChatScreenProps {
  initialMessage?: string;
  chatContext?: {
    category: string;
    categoryType: string;
    title: string;
    sourceScreen?: string;
    adaResponse?: string;
  };
  onBack?: () => void;
  onChatHistoryClick?: () => void;
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function ChatScreen({ initialMessage, chatContext, onBack, onChatHistoryClick, messages: externalMessages = [], setMessages: externalSetMessages }: ChatScreenProps = {}) {
  // Use external messages if provided, otherwise use local state
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messages = externalSetMessages ? externalMessages : localMessages;
  const setMessages = externalSetMessages || setLocalMessages;
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initial message when chat opens
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      // Add user's message
      const userMsg: Message = {
        id: Date.now().toString(),
        message: initialMessage,
        sender: 'user'
      };
      setMessages([userMsg]);
      
      // Simulate Ada typing and responding
      setIsTyping(true);
      setTimeout(() => {
        // Check if there's a custom adaResponse in chatContext
        const responseMessage = chatContext?.adaResponse || getAdaResponse(initialMessage).message;
        const response = chatContext?.adaResponse ? { message: responseMessage } : getAdaResponse(initialMessage);
        
        const adaMsg: Message = {
          id: (Date.now() + 1).toString(),
          message: response.message,
          sender: 'assistant',
          simulator: response.simulator
        };
        setMessages(prev => [...prev, adaMsg]);
        setIsTyping(false);
      }, 1500);
    } else if (initialMessage && messages.length > 0 && messages[messages.length - 1].sender === 'user' && messages[messages.length - 1].message === initialMessage) {
      // If the last message is the user's initial message and there's no response yet
      const hasResponse = messages.length > 1 && messages[messages.length - 1].sender === 'assistant';
      if (!hasResponse) {
        // Simulate Ada typing and responding
        setIsTyping(true);
        setTimeout(() => {
          // Check if there's a custom adaResponse in chatContext
          const responseMessage = chatContext?.adaResponse || getAdaResponse(initialMessage).message;
          const response = chatContext?.adaResponse ? { message: responseMessage } : getAdaResponse(initialMessage);
          
          const adaMsg: Message = {
            id: (Date.now() + 1).toString(),
            message: response.message,
            sender: 'assistant',
            simulator: response.simulator
          };
          setMessages(prev => [...prev, adaMsg]);
          setIsTyping(false);
        }, 1500);
      }
    }
  }, [initialMessage]);

  const getAdaResponse = (userMessage: string): { message: string; simulator?: { type: 'retirement' | 'investment' | 'spending' | 'tax'; initialValues?: Record<string, number> } } => {
    // Simple response logic based on keywords
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('what changed in the markets') || msg.includes("what's changed")) {
      return {
        message: "Markets have increased their expectations for interest-rate cuts in the coming months. As a result, growth stocks — particularly technology — have risen more than the broader market."
      };
    } else if (msg.includes('why does this affect my portfolio')) {
      return {
        message: "Because growth stocks make up 33% of your total portfolio allocation, this shift in rate expectations has a larger impact on your returns than it would in a more balanced allocation.\n\nWould you like to review your portfolio concentration or keep monitoring this for now?"
      };
    } else if (msg.includes('review tech allocation') || msg.includes('tech allocation')) {
      return {
        message: "Your technology allocation currently stands at 48% (AAPL, MSFT, AMZN), which exceeds your target range of 35-40%. While the Fed's anticipated rate cuts are expanding tech multiples, this concentration introduces notable sector-specific risk.\n\nI recommend rebalancing 8-10% into diversified equities or fixed income to better align with your risk profile while preserving growth exposure.\n\nWould you like me to prepare a detailed rebalancing plan, or shall we explore which specific positions to adjust?"
      };
    } else if (msg.includes('model risk scenarios') || msg.includes('risk scenarios')) {
      return {
        message: "I've created an interactive scenario simulator below. Adjust the parameters to see how different allocation strategies impact your portfolio over time.\n\nBased on your risk tolerance, reducing tech to 40% offers optimal balance between stability and growth.\n\nShall I prepare a detailed rebalancing plan, or would you like to discuss the trade-offs further?",
        simulator: {
          type: 'investment',
          initialValues: {
            initialAmount: 90000,
            monthlyAddition: 3000,
            years: 10,
            returnRate: 7,
          }
        }
      };
    } else if (msg.includes('explore bond options') || msg.includes('bond options')) {
      return {
        message: "Given your current 15% bond allocation—below your 25% target—here are three high-quality options aligned with your objectives:\n\nGCC Sovereign Bonds: 4.8-5.2% yield, AAA rated\nEM Corporate Debt: 6.1% yield, BBB+ rated\nGlobal Aggregate Fund: 4.5% yield, diversified exposure\n\nWith recent institutional inflows of $4.2B into GCC bonds, confidence in the region remains strong. Allocating an additional 10% to bonds could reduce portfolio volatility by 3-4% while generating stable income.\n\nWhich option resonates with your goals, or would you like to compare them in detail?"
      };
    } else if (msg.includes('compare scenarios') && msg.includes('bond')) {
      return {
        message: "I've set up a comparison tool below. Adjust your bond allocation to see the impact on volatility and returns.\n\nMoving to your 25% target would reduce portfolio volatility by approximately 3.2%, add an estimated $1,050 monthly in bond income, and modestly lower growth potential by 0.4% annually.\n\nWould you like specific bond recommendations, or shall we model the transition timeline?",
        simulator: {
          type: 'investment',
          initialValues: {
            initialAmount: 90000,
            monthlyAddition: 2500,
            years: 15,
            returnRate: 5.5,
          }
        }
      };
    } else if (msg.includes('what does this mean for my returns') || msg.includes('mean for my returns')) {
      return {
        message: "Your lower growth allocation (58% versus the 73% market average) means market surges typically produce 15-20% smaller gains for your portfolio. In the recent year-end rally:\n\nMarket average gain: +3.8%\nYour estimated gain: +3.1%\n\nHowever, this defensive positioning also means 12-18% smaller losses during downturns. This trade-off aligns with your balanced risk approach, and your year-to-date performance of +2.44% remains solid given your conservative stance.\n\nWould you like to explore adjusting your growth exposure, or review how this positioning serves your long-term goals?"
      };
    } else if (msg.includes('more growth exposure') || msg.includes('growth exposure')) {
      return {
        message: "Use the simulator below to model increasing your growth exposure from 58% to 65-70%.\n\nPotential benefits:\n• Capture more upside in bull markets (+0.8-1.2% potential annual return)\n• Better alignment with peer average allocations\n\nTrade-offs:\n• Volatility increase of 4-6%\n• Amplified losses during market corrections\n\nGiven your current risk tolerance, I'd recommend a measured approach: gradually shift 3-5% to growth assets quarterly.\n\nShall I model specific growth investments, or would you prefer to discuss the timing of any adjustments?",
        simulator: {
          type: 'investment',
          initialValues: {
            initialAmount: 90000,
            monthlyAddition: 3500,
            years: 10,
            returnRate: 8.5,
          }
        }
      };
    } else if (msg.includes('dive deeper') && msg.includes('portfolio')) {
      return {
        message: "Let's examine your portfolio's key metrics:\n\nPerformance: +2.44% year-to-date ($2,210 gain)\nRisk level: Within your target range\n\nAllocation versus targets:\n• Technology: 48% (above 35-40% target)\n• Bonds: 15% (below 25% target)\n• Overall: 92% on-target\n\nPriority considerations:\n1. Rebalance tech exposure (reduce by 8-10%)\n2. Increase bond allocation (add 10%)\n3. Maintain current performance momentum\n\nYour defensive positioning continues to serve you well.\n\nWhich area would you like to explore first—the tech rebalance or bond opportunities?"
      };
    } else if (msg.includes('simple scenario') || msg.includes('show me a simple scenario')) {
      return {
        message: "I've set up a scenario simulator below. Adjust the allocation to see how it performs during market corrections and rallies.\n\nYour current allocation prioritizes stability. This adjustment would enhance that protection further.\n\nWould you like to explore implementing this shift, or model alternative scenarios?",
        simulator: {
          type: 'investment',
          initialValues: {
            initialAmount: 90000,
            monthlyAddition: 2000,
            years: 10,
            returnRate: 7,
          }
        }
      };
    } else if (msg.includes('mean over time') || msg.includes('what does this mean over time')) {
      return {
        message: "Use the simulator below to model your portfolio over different time horizons.\n\nOver a 5-10 year horizon, your higher growth allocation suggests:\n\nProjected outcomes:\n• Your 10-year projected return: 7.8% annually\n• Peer average projection: 6.4% annually\n• Your advantage: Approximately +$45,000 over 10 years\n\nConsiderations:\n• Expect 2-3 larger drawdowns during corrections\n• Higher year-to-year volatility\n• Requires sustained discipline through market cycles\n\nWould you like to discuss downside protection strategies, or review your long-term targets?",
        simulator: {
          type: 'investment',
          initialValues: {
            initialAmount: 90000,
            monthlyAddition: 3000,
            years: 10,
            returnRate: 7.8,
          }
        }
      };
    } else if (msg.includes('retirement') || (msg.includes('plan') && msg.includes('future'))) {
      return {
        message: "Let me help you model your retirement plan. I've set up a simulator below where you can adjust your monthly contributions, time horizon, and expected returns.\n\nBased on your current trajectory and risk profile, I recommend maintaining consistent contributions while balancing growth and preservation.\n\nWhat retirement age are you targeting, and would you like to discuss specific retirement income goals?",
        simulator: {
          type: 'retirement',
          initialValues: {
            monthlyContribution: 5000,
            years: 20,
            returnRate: 7,
          }
        }
      };
    } else if (msg.includes('spending') || (msg.includes('budget') && msg.includes('future'))) {
      return {
        message: "I've created a spending projection simulator below. Adjust the inflation rate and time horizon to see how your expenses might grow over time.\n\nUnderstanding future spending needs is crucial for retirement planning and ensuring your portfolio can support your lifestyle.\n\nWould you like to discuss strategies for managing inflation risk in your portfolio?",
        simulator: {
          type: 'spending',
          initialValues: {
            monthlySpending: 8000,
            inflationRate: 3,
            years: 30,
          }
        }
      };
    } else if (msg.includes('tax') || msg.includes('optimize tax')) {
      return {
        message: "Use the tax optimization simulator below to see how different deduction strategies impact your after-tax income.\n\nTax-efficient portfolio management can significantly enhance your net returns. I can help identify opportunities for tax-loss harvesting, strategic withdrawals, and optimal account placement.\n\nWould you like to explore specific tax optimization strategies for your situation?",
        simulator: {
          type: 'tax',
          initialValues: {
            income: 500000,
            deductions: 50000,
            taxRate: 35,
          }
        }
      };
    } else if (msg.includes('regional opportunities') || msg.includes('compare regional')) {
      return {
        message: "Based on your portfolio and risk profile, here's my regional assessment:\n\nNorth America: Mature growth, technology-heavy\n• Fit for your profile: 7/10 (already well-exposed)\n\nEurope: Value opportunities, defensive positioning\n• Fit for your profile: 8/10 (adds diversification)\n\nAsia Pacific: High growth potential\n• Fit for your profile: 6/10 (increases volatility)\n\nEmerging Markets: Maximum growth, higher risk\n• Fit for your profile: 5/10 (above risk tolerance)\n\nRecommendation: Consider adding 5-8% European exposure for enhanced balance.\n\nWould you like specific fund recommendations, or shall we discuss the timing of any regional adjustments?"
      };
    } else if (msg.includes('emerging regions') || msg.includes('regions to watch')) {
      return {
        message: "Based on current macroeconomic trends and your profile, here are emerging regions worth monitoring:\n\nIndia: GDP growth 6.5%, favorable demographics\n• Best suited for: Long-term growth exposure (10+ years)\n• Risk level: High\n\nVietnam: Manufacturing hub growth\n• Best suited for: Diversification from China\n• Risk level: Moderate-High\n\nGCC Markets: Energy transition and sovereign wealth\n• Best suited for: Stability with growth (aligns with your profile)\n• Risk level: Moderate\n\nMexico: Nearshoring beneficiary\n• Best suited for: Trade-dependent growth\n• Risk level: Moderate\n\nGiven your risk tolerance, I'd recommend initiating with GCC markets at 3-5% allocation.\n\nWould you like to explore specific investment vehicles, or discuss the implementation timeline?"
      };
    } else if (msg.includes('tech') || msg.includes('allocation')) {
      return {
        message: "I can help you review your technology allocation. Currently, you hold 48% in tech stocks (AAPL, MSFT, AMZN). Given the recent Fed rate-cut expectations, growth multiples are expanding, though this also introduces concentration risk.\n\nWould you like me to model different allocation scenarios, or review specific positions within your tech holdings?"
      };
    } else if (msg.includes('bond') || msg.includes('fixed income')) {
      return {
        message: "Your current bond allocation stands at 15%, which is below your 25% target. With recent institutional inflows of $4.2B into GCC bonds, there's heightened interest in high-yielding regional debt.\n\nWould you like to see specific bond opportunities that align with your goals, or shall we discuss the optimal pace for increasing your allocation?"
      };
    } else if (msg.includes('portfolio') || msg.includes('risk')) {
      return {
        message: "Your portfolio is performing well, up 0.8% since yesterday. Risk remains within your agreed parameters, and I'm monitoring several factors that could affect your holdings.\n\nWhat specific aspect would you like to explore—current allocations, performance drivers, or upcoming opportunities?"
      };
    } else if (msg.includes('return') || msg.includes('growth')) {
      return {
        message: "Given your current allocation, your portfolio maintains a balanced risk-return profile. Year-to-date you're up $2,210.1 (+2.44%). Your lower growth exposure provides stability, though it may limit gains during strong market surges.\n\nWould you like me to model how adjusting your growth exposure could impact returns, or review how this aligns with your long-term objectives?"
      };
    } else {
      return {
        message: "Could you provide more details? I'm ready to help with portfolio analysis, risk modeling, or market insights."
      };
    }
  };

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      message: value,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate Ada typing
    setIsTyping(true);
    setTimeout(() => {
      const response = getAdaResponse(value);
      const adaMsg: Message = {
        id: (Date.now() + 1).toString(),
        message: response.message,
        sender: 'assistant',
        simulator: response.simulator
      };
      setMessages(prev => [...prev, adaMsg]);
      setIsTyping(false);
    }, 1500);
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

  // Dynamic suggested questions based on context
  const getSuggestedQuestions = (): string[] => {
    if (messages.length === 0) {
      return [
        'Review my tech allocation',
        'Show me bond opportunities',
        'What\'s my portfolio risk?'
      ];
    }
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === 'assistant') {
      if (lastMessage.message.includes('Markets have increased their expectations for interest-rate cuts')) {
        return [
          'Why does this affect my portfolio?',
          'How much of my portfolio is exposed?'
        ];
      } else if (lastMessage.message.includes('this shift in rate expectations has a larger impact on your returns')) {
        return [
          'See affected holdings',
          'Review my exposure',
          'Contact advisor'
        ];
      } else if (lastMessage.message.includes('allocation scenarios')) {
        return [
          'Yes, show me scenarios',
          'What are the risks?'
        ];
      } else if (lastMessage.message.includes('bond opportunities')) {
        return [
          'Yes, show options',
          'What are the yields?'
        ];
      } else if (lastMessage.message.includes('growth exposure')) {
        return [
          'Model the impact',
          'Compare to my goals'
        ];
      }
    }
    
    return [
      'Tell me more',
      'Show me the numbers'
    ];
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] pt-0 px-0 w-full z-10">
        <TopBar />
        <ChatHeader onBack={handleBack} />
      </div>

      {/* Scrollable Messages */}
      <div className="absolute top-[88px] left-0 right-0 bottom-[196px] overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] py-[12px] w-full pb-[20px]">
          {messages.length > 0 && (
            <>
              {/* Daily Chat Indicator */}
              <div className="w-full flex items-center justify-center mb-[12px] mt-[16px]">
                <div className="bg-white/60 rounded-full px-[16px] py-[6px] border border-[#e3e3e3]">
                  <p className="font-['DM_Sans:Light',sans-serif] text-[#555555] text-[11px] tracking-[-0.22px] text-center">
                    Today
                  </p>
                </div>
              </div>
              
              {/* Ada Capabilities Info */}
              <div className="w-full flex items-center justify-center mb-[16px]">
                <div className="max-w-[90%]">
                  <p className="font-['DM_Sans:Light',sans-serif] text-[#555555] text-[12px] tracking-[-0.24px] text-center leading-[1.5] opacity-70">
                    I can analyze your portfolio, model risk scenarios, explore investment opportunities, and provide personalized guidance.
                  </p>
                </div>
              </div>

              {/* Messages Container */}
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
                            contextPrefix={index === 0 && msg.sender === 'user' && chatContext ? chatContext.title : undefined}
                          />
                        </React.Fragment>
                      ))}
                      
                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="self-start max-w-[85%]">
                          <div className="bg-white rounded-[16px] px-[16px] py-[12px]">
                            <div className="flex gap-[4px] items-center">
                              <div className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-[6px] h-[6px] bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
          
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full pt-[40px] px-[24px]">
              {/* Atom Icon */}
              <div className="mb-[16px]">
                <AtomIcon size={55} />
              </div>
              
              <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[24px] tracking-[-0.48px] text-center mb-[6px]">
                How can I help you today?
              </p>
              <p className="font-['DM_Sans:Light',sans-serif] text-[#555555] text-[14px] text-center opacity-70">
                Ask me anything about your portfolio,<br />investments, or market insights.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Suggested Questions - Hide when typing */}
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

        {/* Bottom Bar with Input */}
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