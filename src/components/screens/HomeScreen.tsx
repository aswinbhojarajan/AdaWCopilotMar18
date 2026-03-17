import React from 'react';
import { TopBar, Header, Navigation, BottomBar, SummaryCard, ContentCard, SimpleSparkline } from '../ada';
import { SparkIcon } from '../ada/SparkIcon';
import imgVideoThumb from 'figma:asset/f2dddff10fce8c5cc0468d3c13d16d6eeadcbdb7.png';

interface HomeScreenProps {
  onChatHistoryClick?: () => void;
  onNotificationsClick?: () => void;
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  onClose?: () => void;
}

export function HomeScreen({ onChatHistoryClick, onNotificationsClick, onChatSubmit, hasActiveChatToday, onResumeChat, onOpenChat, onClose }: HomeScreenProps = {}) {
  // Generate current date in format "12 Jan 2026"
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Sample sparkline data - last 30 days showing upward trend
  const portfolioSparklineData = [
    { value: 129000 },
    { value: 129500 },
    { value: 129200 },
    { value: 130000 },
    { value: 130200 },
    { value: 130500 },
    { value: 130800 },
    { value: 131230.19 }
  ];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      {/* Fixed Header - includes TopBar, Ada Logo, and Navigation */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="home" onTabChange={() => {}} />
      </div>

      {/* Scrollable Content - starts after header */}
      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
          {/* Today's Summary Card */}
          <SummaryCard
            date="TODAY'S SUMMARY"
            title={getCurrentDate()}
            subtitle="There's 1 item that needs your attention today, plus a few updates worth reviewing."
          />

          {/* Portfolio Overview Card */}
          <div className="bg-white relative rounded-[30px] shrink-0 w-full">
            <div className="size-full">
              <div className="content-stretch flex flex-col items-start pb-[20px] pt-[20px] px-[24px] relative w-full">
                <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                  {/* Portfolio Overview Section */}
                  <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">PORTFOLIO OVERVIEW</p>
                    
                    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                      {/* Portfolio Description */}
                      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                        No changes needed today, Abdullah. Your portfolio remains on track.
                      </p>
                      
                      {/* Portfolio Value Container */}
                      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[rgba(85,85,85,0.8)] text-[10px] tracking-[0.8px] uppercase">Portfolio Value</p>
                        
                        {/* Portfolio Value and Change Badge */}
                        <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
                          <p className="font-['Crimson_Pro:ExtraLight',sans-serif] font-extralight leading-[28px] relative shrink-0 text-[#555555] text-[40px] text-nowrap tracking-[-1.2px] whitespace-pre">$94,830.19</p>
                          <div className="bg-[#c6ff6a] content-stretch flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0">
                            <div className="relative shrink-0 size-[8px]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                                <path d="M4 0 L8 8 L0 8 Z" fill="#03561A" />
                              </svg>
                            </div>
                            <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#03561a] text-[12px] text-nowrap whitespace-pre">+$758.64 (+0.8%) 1D</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Portfolio Stats */}
                      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                        
                        {/* Sparkline */}
                        <SimpleSparkline
                          data={portfolioSparklineData}
                          color="#992929"
                          fillGradient={{
                            startColor: 'rgba(153, 41, 41, 0.1)',
                            endColor: 'rgba(153, 41, 41, 0.01)'
                          }}
                          height={50}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
                    <button 
                      onClick={() => onChatSubmit?.('Dive deeper into my portfolio performance', {
                        category: 'PORTFOLIO PERFORMANCE',
                        categoryType: 'PORTFOLIO OVERVIEW',
                        title: 'Portfolio up +2.44% ($2,210)',
                        sourceScreen: 'home'
                      })}
                      className="bg-[#441316] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0"
                    >
                      <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                        <SparkIcon />
                      </div>
                      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-white text-[12px] text-nowrap whitespace-pre">Dive deeper</p>
                    </button>
                    <button className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0">
                      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
                      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Contact advisor</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Risk Alert Card */}
          <ContentCard
            category="PORTFOLIO RISK ALERT"
            categoryType="PORTFOLIO RISK ALERT"
            title="Your growth stocks allocation has moved above target"
            description="Current exposure is 33%, above your 20–30% target range."
            timestamp="2 hours ago"
            buttonText="What's changed?"
            onButtonClick={() => onChatSubmit?.("What's changed?", {
              category: 'PORTFOLIO RISK ALERT',
              categoryType: 'PORTFOLIO RISK ALERT',
              title: 'Tech allocation above target',
              sourceScreen: 'Home'
            })}
          />

          {/* Market Opportunity Card */}
          <ContentCard
            category="MARKET OPPORTUNITY INSIGHT"
            categoryType="MARKET OPPORTUNITY INSIGHT"
            title="GCC bonds are seeing renewed investor demand"
            description="Yields remain attractive for short-dated bonds."
            timestamp="5 hours ago"
            buttonText="Explore GCC bond opportunities"
            onButtonClick={() => onChatSubmit?.('Explore GCC bond opportunities', {
              category: 'MARKET OPPORTUNITY INSIGHT',
              categoryType: 'MARKET OPPORTUNITY INSIGHT',
              title: 'GCC bonds renewed demand',
              sourceScreen: 'Home'
            })}
          />

          {/* News Card with Video */}
          <ContentCard
            category="NEWS"
            categoryType="NEWS"
            title="Markets jump on an unexpected year-end surge."
            description="Because your portfolio is tilted toward growth assets, this rally is likely to deliver larger short-term gains."
            image="https://images.unsplash.com/photo-1761850167081-473019536383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMGdyb3d0aCUyMGNoYXJ0fGVufDF8fHx8MTc2ODM5MDcxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            timestamp="37 min ago"
            buttonText="How does this impact my portfolio?"
            secondaryButtonText="Should I consider a more balanced portfolio?"
            topicLabelColor="#992929"
            sourcesCount={68}
            onButtonClick={() => onChatSubmit?.('How does this impact my portfolio?', {
              category: 'NEWS',
              categoryType: 'NEWS',
              title: 'Year-end market surge',
              sourceScreen: 'Home'
            })}
            onSecondaryButtonClick={() => onChatSubmit?.('Should I consider a more balanced portfolio?', {
              category: 'NEWS',
              categoryType: 'NEWS',
              title: 'Year-end market surge',
              sourceScreen: 'Home'
            })}
          />
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
        />
      </div>
    </div>
  );
}