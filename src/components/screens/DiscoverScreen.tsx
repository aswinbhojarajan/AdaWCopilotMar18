import React, { useState } from 'react';
import { TopBar, Header, Navigation, BottomBar, Tag, ContentCard } from '../ada';

interface DiscoverScreenProps {
  onChatHistoryClick?: () => void;
  onNotificationsClick?: () => void;
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  onClose?: () => void;
}

// Content data structure
const contentData = {
  forYou: [
    {
      category: "YOUR PORTFOLIO",
      categoryType: "YOUR PORTFOLIO",
      title: "Alternative investments show 23% lower correlation to public markets",
      contextTitle: "Low alternatives allocation",
      description: "Your 10% alternatives allocation (crypto and commodities) is below the 12-15% recommended for portfolios of your size seeking true diversification.",
      timestamp: "2 days ago",
      buttonText: "Show me alternatives that fit my portfolio",
      secondaryButtonText: "How would this change my risk?",
      image: "https://s.wsj.net/public/resources/images/IF-AD336_RETIRE_M_20171129173731.jpg",
      sourcesCount: 41,
      detailSections: [
        {
          title: "Why alternatives matter:",
          content: [
            "Hedged risk during market downturns",
            "Access to unique return streams",
            "Portfolio protection in high-inflation environments"
          ]
        },
        {
          title: "Available opportunities:",
          content: "Private equity and private credit are available options beyond your current holdings."
        }
      ]
    },
    {
      category: "YOUR PORTFOLIO",
      categoryType: "YOUR PORTFOLIO",
      title: "Your tech allocation outperformed by 12% this quarter",
      contextTitle: "Tech outperformance this quarter",
      description: "AI and semiconductor holdings drove strong gains. Consider rebalancing to lock in profits while maintaining growth exposure.",
      timestamp: "8 min ago",
      buttonText: "Should I rebalance now?",
      secondaryButtonText: "Show optimal profit-taking strategy",
      image: "https://static01.nyt.com/images/2024/08/27/climate/26cli-askclimate-ai/26cli-askclimate-ai-articleLarge.jpg?quality=75&auto=webp&disable=upscale",
      detailSections: [
        {
          title: "Performance breakdown:",
          content: [
            "Tech holdings: +12.3% vs +8.1% sector average",
            "AI infrastructure stocks: +18.2%",
            "Semiconductor positions: +15.7%"
          ]
        },
        {
          title: "Advisor recommendation:",
          content: "Consider taking 20% profits from strongest performers to maintain your risk target while preserving upside potential."
        }
      ]
    },
    {
      category: "OPPORTUNITY",
      categoryType: "OPPORTUNITY",
      title: "Emerging market bonds offer 6.8% yields with improving credit profiles",
      contextTitle: "EM bonds opportunity",
      description: "Your current 15% fixed income allocation could benefit from higher-yielding sovereign debt in stable economies.",
      timestamp: "5 hours ago",
      buttonText: "Compare to my current fixed income",
      secondaryButtonText: "Show me top-rated EM bonds",
      image: "https://images.unsplash.com/photo-1760971439988-b236b4207d47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBidXNpbmVzcyUyMGFic3RyYWN0fGVufDF8fHx8MTc2NzYwMzQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sourcesCount: 63,
      detailSections: [
        {
          title: "Why you're seeing this:",
          content: [
            "Fixed income allocation: 8% (below 20% target)",
            "Current yield on holdings: 4.2%",
            "Credit ratings improving across EM sovereigns"
          ]
        },
        {
          title: "Opportunity details:",
          content: "Allocate 5-7% to EM bonds to boost income generation while maintaining diversification across geographies and credit quality."
        }
      ]
    },
    {
      category: "WEALTH PLANNING",
      categoryType: "WEALTH PLANNING",
      title: "Multi-generational wealth transfer: Structuring for tax efficiency",
      contextTitle: "Estate tax efficiency",
      description: "New regulations create opportunities to reduce estate tax burden by up to 35% through strategic trust structures.",
      timestamp: "3 days ago",
      buttonText: "Model my estate tax scenarios",
      secondaryButtonText: "Compare trust structures for me",
      image: "https://m.wsj.net/video-atmo/20251114/768af122-9e27-4ad1-9835-a287a62d07dd/1/dynasty-header_562x1000.jpg",
      sourcesCount: 28,
      detailSections: [
        {
          title: "Regulatory changes:",
          content: [
            "Estate tax reduction up to 35%",
            "Strategic trust structures",
            "Multi-generational wealth planning"
          ]
        },
        {
          title: "Implementation approach:",
          content: "Work with a financial advisor to model different scenarios and choose the most tax-efficient structure."
        }
      ]
    }
  ],
  
  whatsHappening: [
    {
      category: "MARKET NEWS",
      categoryType: "MARKET NEWS",
      title: "GCC sovereign wealth funds pivot to alternative assets",
      contextTitle: "GCC wealth funds alternative assets pivot",
      description: "Regional institutions allocate $8.2B to private equity and infrastructure this month.",
      timestamp: "42 min ago",
      buttonText: "How does this affect my portfolio?",
      secondaryButtonText: "Show me similar opportunities",
      image: "https://images.unsplash.com/photo-1766214272421-ca9354ba2cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza3lsaW5lJTIwYXJjaGl0ZWN0dXJlJTIwc3Vuc2V0fGVufDF8fHx8MTc2NzYxOTYzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sourcesCount: 54
    },
    {
      category: "MARKET NEWS",
      categoryType: "MARKET NEWS",
      title: "Federal Reserve signals pause on rate cuts through Q2 2026",
      contextTitle: "Fed signals rate cut pause",
      description: "Central bank maintains cautious stance as inflation remains above target. Impact on bond yields expected.",
      timestamp: "1 hour ago",
      buttonText: "Impact on my bond holdings?",
      secondaryButtonText: "Should I adjust my allocations?",
      image: "https://images.unsplash.com/photo-1711967152819-f493f7ab4cf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJibGUlMjBidWlsZGluZyUyMGZhY2FkZXxlbnwxfHx8fDE3Njc2MTk2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sourcesCount: 82
    },
    {
      category: "MARKET NEWS",
      categoryType: "MARKET NEWS",
      title: "GCC equity markets outperform global indices for third straight quarter",
      contextTitle: "GCC markets outperformance",
      description: "Strong earnings and economic diversification drive regional market leadership amid global uncertainty.",
      timestamp: "3 hours ago",
      buttonText: "Compare to my regional exposure",
      secondaryButtonText: "Show top GCC opportunities",
      image: "https://images.unsplash.com/photo-1764675107575-7a33cbdb7905?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGRldmVsb3BtZW50JTIwc2t5bGluZXxlbnwxfHx8fDE3Njc2MTk2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sourcesCount: 47
    },
    {
      category: "INVESTMENT EDUCATION",
      categoryType: "INVESTMENT EDUCATION",
      title: "Sustainable investing delivers competitive returns with lower risk",
      contextTitle: "ESG investing returns",
      description: "ESG-screened portfolios matched market returns with 18% less volatility over the past 5 years.",
      timestamp: "5 hours ago",
      buttonText: "Analyze my portfolio's ESG score",
      secondaryButtonText: "Show ESG alternatives for my holdings",
      image: "https://images.unsplash.com/photo-1743352476730-056502fba10b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3Njc2MTk2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      detailSections: [
        {
          title: "Performance insights:",
          content: [
            "ESG leaders: +9.8% annualized vs +9.6% for broad market",
            "Sharpe ratio: 0.82 vs 0.69 for conventional portfolios",
            "Downside capture: 82% vs market average of 95%"
          ]
        }
      ]
    },
    {
      category: "INVESTMENT EDUCATION",
      categoryType: "INVESTMENT EDUCATION",
      title: "Fine wine and rare spirits: An uncorrelated 12% annual return",
      contextTitle: "Wine and spirits investment",
      description: "Investment-grade collectibles offer portfolio diversification with tangible asset backing and strong historical performance.",
      timestamp: "8 hours ago",
      buttonText: "How much should I allocate?",
      secondaryButtonText: "Show available collectibles funds",
      image: "https://images.unsplash.com/photo-1765850258622-9d9afa7cf4e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwY2VsbGFyJTIwYm90dGxlc3xlbnwxfHx8fDE3Njc2MDk0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      detailSections: [
        {
          title: "Asset class performance:",
          content: [
            "Fine wine index: +11.8% annualized (10 years)",
            "Rare whisky: +15.2% annualized (10 years)",
            "Correlation to S&P 500: 0.12"
          ]
        },
        {
          title: "Access and liquidity:",
          content: "Professional-managed funds provide authentication, insurance, optimal storage, and quarterly liquidity windows."
        }
      ]
    },
    {
      category: "INVESTMENT EDUCATION",
      categoryType: "INVESTMENT EDUCATION",
      title: "Institutional crypto adoption reaches inflection point",
      contextTitle: "Institutional crypto adoption",
      description: "Major custody solutions and regulatory clarity make digital assets viable for 2-5% portfolio allocation.",
      timestamp: "Yesterday",
      buttonText: "How have crypto prices been moving?",
      secondaryButtonText: "Which institutions have been investing?",
      image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBuZXR3b3JrfGVufDF8fHx8MTc2NzU0Mzc1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      detailSections: [
        {
          title: "Why now:",
          content: [
            "SEC-approved Bitcoin and Ethereum ETFs",
            "Institutional-grade custody through prime brokers",
            "Improved correlation characteristics during inflation",
            "Enhanced regulatory framework in UAE"
          ]
        },
        {
          title: "Recommended approach:",
          content: "Your holding is primarly in Bitcoin, consider other coins to increase growth exposure."
        }
      ]
    },
    {
      category: "MARKET NEWS",
      categoryType: "MARKET NEWS",
      title: "Luxury real estate prices surge 14% in prime Dubai locations",
      contextTitle: "Dubai luxury real estate surge",
      description: "Strong international demand and limited inventory drive continued appreciation in premium segments.",
      timestamp: "Yesterday",
      buttonText: "Should I increase property allocation?",
      secondaryButtonText: "Show prime Dubai opportunities",
      image: "https://images.unsplash.com/photo-1764675107575-7a33cbdb7905?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGRldmVsb3BtZW50JTIwc2t5bGluZXxlbnwxfHx8fDE3Njc2MTk2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sourcesCount: 38
    }
  ]
};

export function DiscoverScreen({ onChatHistoryClick, onNotificationsClick, onChatSubmit, hasActiveChatToday, onResumeChat, onOpenChat, onClose }: DiscoverScreenProps = {}) {
  const [activeFilter, setActiveFilter] = useState<'forYou' | 'whatsHappening'>('forYou');

  // Get filtered content based on active filter
  const displayedContent = contentData[activeFilter];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      {/* Fixed Header - includes TopBar, Ada Logo, and Navigation */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="discover" onTabChange={() => {}} />
      </div>

      {/* Scrollable Content - starts after header */}
      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
          {/* Filter Tags */}
          <div className="relative shrink-0 w-full">
            <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
                <Tag active={activeFilter === 'forYou'} onClick={() => setActiveFilter('forYou')}>
                  For You
                </Tag>
                <Tag active={activeFilter === 'whatsHappening'} onClick={() => setActiveFilter('whatsHappening')}>
                  What's Happening
                </Tag>
              </div>
            </div>
          </div>

          {/* Dynamic Content Cards */}
          {displayedContent.map((item, index) => (
            <ContentCard
              key={`${activeFilter}-${index}`}
              {...item}
              onChatSubmit={onChatSubmit}
              forceSecondaryButtonStyle={true}
            />
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar 
          onSubmit={onChatSubmit} 
          onChatHistoryClick={onChatHistoryClick}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={onResumeChat}
          onOpenChat={onOpenChat}
          onClose={onClose}
        />
      </div>
    </div>
  );
}