import React from 'react';
import { 
  TopBar, 
  Header, 
  Navigation,
  BottomBar,
  Button,
  PollOption,
  SlideNotification,
  SummaryCard,
  ContentCard
} from '../ada';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import svgPaths from '../../imports/svg-njo1xhaulo';

interface LoungeScreenProps {
  onChatHistoryClick?: () => void;
  onNotificationsClick?: () => void;
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  onPollVote?: () => void;
  onNavigateToWealth?: () => void;
  onClose?: () => void;
}

// Mock poll results data
const POLL_RESULTS = {
  'north-america': 32,
  'europe': 18,
  'asia-pacific': 24,
  'emerging-markets': 12,
  'global-diversified': 14
};

export function LoungeScreen({ onChatHistoryClick, onNotificationsClick, onChatSubmit, hasActiveChatToday, onResumeChat, onOpenChat, onPollVote, onNavigateToWealth, onClose }: LoungeScreenProps = {}) {
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [showNotification, setShowNotification] = React.useState(false);

  // Generate current date in format "14 Jan 2026"
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleVote = (value: string) => {
    setSelectedRegion(value);
    setHasVoted(true);
    onPollVote?.(); // Notify App that user has voted
    
    // Show notification after a brief delay to let results animate in
    setTimeout(() => {
      setShowNotification(true);
    }, 1500);
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      {/* Fixed Header - includes TopBar, Ada Logo, and Navigation */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="lounge" onTabChange={() => {}} />
      </div>

      {/* Scrollable Content - starts after header */}
      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
          
          {/* Weekly Insights Summary Card */}
          <SummaryCard
            date="WEEKLY INSIGHTS"
            title={getCurrentDate()}
            subtitle="What 6,372 investors like you are focusing on this week."
            showSubBodycopy={true}
          >
            <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 w-full">
              <Clock className="shrink-0" size={12} strokeWidth={1.5} color="#555555" />
              <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
                <p className="leading-[18px] whitespace-pre">Insights refreshing in 4 days</p>
              </div>
            </div>
          </SummaryCard>

          {/* Market Trend Card - Global Equity Funds */}
          <ContentCard
            categoryType="MARKET ANALYSIS"
            customTopic="THIS WEEK"
            title="Global equity funds are seeing renewed interest—43% of investors like you increased exposure this week"
            contextTitle="Global equity funds renewed interest"
            description="This marks the highest weekly uptick in three months, with peer engagement concentrated in developed market allocations."
            timestamp="Updated today"
            buttonText="Why is this happening?"
            secondaryButtonText="What usually happens next?"
            stackButtons={true}
            hideIntent={true}
            onChatSubmit={onChatSubmit}
          />

          {/* Types of Investors Card - Left-Aligned Layout */}
          <div className="bg-white relative rounded-[30px] shrink-0 w-full">
            <div className="size-full">
              <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
                <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                      <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] h-[14px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">Investors like you</p>
                      </div>
                      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">You allocate more to stocks than 68% of similar investors</p>
                      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[12px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                        Average portfolio allocation comparison
                      </p>
                    </div>

                    {/* Asset Allocation Comparison Chart */}
                    <div className="bg-[#f7f6f2] overflow-clip relative rounded-[8px] shrink-0 w-full p-4">
                      <div className="flex flex-col gap-[16px]">
                        {/* Stocks */}
                        <div className="flex flex-col gap-[4px]">
                          <div className="flex items-center justify-between">
                            <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">Stocks</p>
                            <div className="flex gap-[12px]">
                              <p className="font-['DM_Sans:Medium',sans-serif] text-[12px] text-[#992929]">You: 55%</p>
                              <p className="font-['DM_Sans:Regular',sans-serif] text-[12px] text-[#555555] opacity-60">Peers: 45%</p>
                            </div>
                          </div>
                          <div className="flex gap-[2px] h-[24px]">
                            <div className="bg-[#d9b3b5] rounded-[2px]" style={{ width: '55%' }} />
                            <div className="bg-[#441316] opacity-30 rounded-[2px]" style={{ width: '45%' }} />
                            <div className="flex-1" />
                          </div>
                        </div>

                        {/* Crypto */}
                        <div className="flex flex-col gap-[4px]">
                          <div className="flex items-center justify-between">
                            <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">Crypto</p>
                            <div className="flex gap-[12px]">
                              <p className="font-['DM_Sans:Medium',sans-serif] text-[12px] text-[#992929]">You: 6%</p>
                              <p className="font-['DM_Sans:Regular',sans-serif] text-[12px] text-[#555555] opacity-60">Peers: 8%</p>
                            </div>
                          </div>
                          <div className="flex gap-[2px] h-[24px]">
                            <div className="bg-[#a87174] rounded-[2px]" style={{ width: '6%' }} />
                            <div className="bg-[#441316] opacity-30 rounded-[2px]" style={{ width: '8%' }} />
                            <div className="flex-1" />
                          </div>
                        </div>

                        {/* Bonds */}
                        <div className="flex flex-col gap-[4px]">
                          <div className="flex items-center justify-between">
                            <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">Bonds</p>
                            <div className="flex gap-[12px]">
                              <p className="font-['DM_Sans:Medium',sans-serif] text-[12px] text-[#992929]">You: 15%</p>
                              <p className="font-['DM_Sans:Regular',sans-serif] text-[12px] text-[#555555] opacity-60">Peers: 22%</p>
                            </div>
                          </div>
                          <div className="flex gap-[2px] h-[24px]">
                            <div className="bg-[#6d3f42] rounded-[2px]" style={{ width: '15%' }} />
                            <div className="bg-[#441316] opacity-30 rounded-[2px]" style={{ width: '22%' }} />
                            <div className="flex-1" />
                          </div>
                        </div>

                        {/* Cash */}
                        <div className="flex flex-col gap-[4px]">
                          <div className="flex items-center justify-between">
                            <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">Cash</p>
                            <div className="flex gap-[12px]">
                              <p className="font-['DM_Sans:Medium',sans-serif] text-[12px] text-[#992929]">You: 20%</p>
                              <p className="font-['DM_Sans:Regular',sans-serif] text-[12px] text-[#555555] opacity-60">Peers: 15%</p>
                            </div>
                          </div>
                          <div className="flex gap-[2px] h-[24px]">
                            <div className="bg-[#441316] rounded-[2px]" style={{ width: '20%' }} />
                            <div className="bg-[#441316] opacity-30 rounded-[2px]" style={{ width: '15%' }} />
                            <div className="flex-1" />
                          </div>
                        </div>

                        {/* Commodities */}
                        <div className="flex flex-col gap-[4px]">
                          <div className="flex items-center justify-between">
                            <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">Commodities</p>
                            <div className="flex gap-[12px]">
                              <p className="font-['DM_Sans:Medium',sans-serif] text-[12px] text-[#992929]">You: 4%</p>
                              <p className="font-['DM_Sans:Regular',sans-serif] text-[12px] text-[#555555] opacity-60">Peers: 10%</p>
                            </div>
                          </div>
                          <div className="flex gap-[2px] h-[24px]">
                            <div className="bg-[#8b5a5e] rounded-[2px]" style={{ width: '4%' }} />
                            <div className="bg-[#441316] opacity-30 rounded-[2px]" style={{ width: '10%' }} />
                            <div className="flex-1" />
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-[16px] items-center justify-center pt-[8px] border-t border-[#555555] border-opacity-20">
                          <div className="flex gap-[6px] items-center">
                            <div className="w-[12px] h-[12px] bg-[#a87174] rounded-[2px]" />
                            <p className="font-['DM_Sans:Regular',sans-serif] text-[10px] text-[#555555]">Your allocation</p>
                          </div>
                          <div className="flex gap-[6px] items-center">
                            <div className="w-[12px] h-[12px] bg-[#441316] opacity-30 rounded-[2px]" />
                            <p className="font-['DM_Sans:Regular',sans-serif] text-[10px] text-[#555555]">Peer average</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subheadline and Body Copy */}
                    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                      <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
                        Your higher stock allocation positions you for stronger long-term growth potential.
                      </p>
                      <p className="font-['DM_Sans:Light',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
                        This positioning can enhance upside potential while accepting slightly higher short-term volatility.
                      </p>
                    </div>

                    {/* Stacked CTA Buttons */}
                    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                      <Button variant="ai-chat" onClick={() => onChatSubmit?.('Show me a simple scenario', {
                        category: 'COLLECTIVE INSIGHT',
                        categoryType: 'MARKET ANALYSIS',
                        title: 'Higher stock allocation vs peers',
                        sourceScreen: 'collective'
                      })}>Show me a simple scenario</Button>
                      <Button variant="ai-chat" onClick={() => onChatSubmit?.('What does this mean over time?', {
                        category: 'COLLECTIVE INSIGHT',
                        categoryType: 'MARKET ANALYSIS',
                        title: 'Higher stock allocation vs peers',
                        sourceScreen: 'collective'
                      })}>What does this mean over time?</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Pulse Poll Card */}
          <div className="bg-white relative rounded-[30px] shrink-0 w-full">
            <div className="size-full">
              <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
                <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                  {/* Header Section */}
                  <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                      <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                          COMMUNITY PULSE
                        </p>
                      </div>
                      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                        Which region do you feel most confident investing in right now?
                      </p>
                      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                        Vote to see where sentiment is strongest and how you compare to the community.
                      </p>
                    </div>

                    {/* Poll Options */}
                    {hasVoted ? (
                      <div className="bg-[#f7f6f2] overflow-clip relative rounded-[8px] shrink-0 w-full p-4">
                        <div className="flex flex-col gap-[16px]">
                          <PollOption 
                            name="region-poll" 
                            value="north-america" 
                            label="North America" 
                            onChange={handleVote}
                            checked={selectedRegion === 'north-america'}
                            showResults={hasVoted}
                            percentage={POLL_RESULTS['north-america']}
                            isUserSelection={selectedRegion === 'north-america'}
                          />
                          <PollOption 
                            name="region-poll" 
                            value="europe" 
                            label="Europe" 
                            onChange={handleVote}
                            checked={selectedRegion === 'europe'}
                            showResults={hasVoted}
                            percentage={POLL_RESULTS['europe']}
                            isUserSelection={selectedRegion === 'europe'}
                          />
                          <PollOption 
                            name="region-poll" 
                            value="asia-pacific" 
                            label="Asia Pacific" 
                            onChange={handleVote}
                            checked={selectedRegion === 'asia-pacific'}
                            showResults={hasVoted}
                            percentage={POLL_RESULTS['asia-pacific']}
                            isUserSelection={selectedRegion === 'asia-pacific'}
                          />
                          <PollOption 
                            name="region-poll" 
                            value="emerging-markets" 
                            label="Emerging Markets" 
                            onChange={handleVote}
                            checked={selectedRegion === 'emerging-markets'}
                            showResults={hasVoted}
                            percentage={POLL_RESULTS['emerging-markets']}
                            isUserSelection={selectedRegion === 'emerging-markets'}
                          />
                          <PollOption 
                            name="region-poll" 
                            value="global-diversified" 
                            label="Global/Diversified" 
                            onChange={handleVote}
                            checked={selectedRegion === 'global-diversified'}
                            showResults={hasVoted}
                            percentage={POLL_RESULTS['global-diversified']}
                            isUserSelection={selectedRegion === 'global-diversified'}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                        <PollOption 
                          name="region-poll" 
                          value="north-america" 
                          label="North America" 
                          onChange={handleVote}
                          checked={selectedRegion === 'north-america'}
                          showResults={hasVoted}
                          percentage={POLL_RESULTS['north-america']}
                          isUserSelection={selectedRegion === 'north-america'}
                        />
                        <PollOption 
                          name="region-poll" 
                          value="europe" 
                          label="Europe" 
                          onChange={handleVote}
                          checked={selectedRegion === 'europe'}
                          showResults={hasVoted}
                          percentage={POLL_RESULTS['europe']}
                          isUserSelection={selectedRegion === 'europe'}
                        />
                        <PollOption 
                          name="region-poll" 
                          value="asia-pacific" 
                          label="Asia Pacific" 
                          onChange={handleVote}
                          checked={selectedRegion === 'asia-pacific'}
                          showResults={hasVoted}
                          percentage={POLL_RESULTS['asia-pacific']}
                          isUserSelection={selectedRegion === 'asia-pacific'}
                        />
                        <PollOption 
                          name="region-poll" 
                          value="emerging-markets" 
                          label="Emerging Markets" 
                          onChange={handleVote}
                          checked={selectedRegion === 'emerging-markets'}
                          showResults={hasVoted}
                          percentage={POLL_RESULTS['emerging-markets']}
                          isUserSelection={selectedRegion === 'emerging-markets'}
                        />
                        <PollOption 
                          name="region-poll" 
                          value="global-diversified" 
                          label="Global/Diversified" 
                          onChange={handleVote}
                          checked={selectedRegion === 'global-diversified'}
                          showResults={hasVoted}
                          percentage={POLL_RESULTS['global-diversified']}
                          isUserSelection={selectedRegion === 'global-diversified'}
                        />
                      </div>
                    )}

                    {/* Microcopy */}
                    <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] relative shrink-0 text-[#555555] text-[12px] opacity-60 w-full">
                      {hasVoted ? 'Thank you for voting' : 'View results after you vote'}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                    <Button variant="ai-chat" onClick={() => onChatSubmit?.('Compare regional opportunities for my portfolio', {
                      category: 'COMMUNITY PULSE',
                      categoryType: 'MARKET ANALYSIS',
                      title: 'Regional investment confidence poll',
                      sourceScreen: 'collective'
                    })}>Compare regional opportunities for my portfolio</Button>
                    <Button variant="ai-chat" onClick={() => onChatSubmit?.('Show me emerging regions to watch', {
                      category: 'COMMUNITY PULSE',
                      categoryType: 'MARKET ANALYSIS',
                      title: 'Regional investment confidence poll',
                      sourceScreen: 'collective'
                    })}>Show me emerging regions to watch</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

      {/* Slide Notification */}
      <SlideNotification
        variant="system"
        categoryLabel="ALERT"
        categoryLabelColor="#441316"
        message="'Buy a Home' goal dropped to 63% after withdrawals. See why you're off track."
        show={showNotification}
        onDismiss={() => setShowNotification(false)}
        actionText="View details"
        onAction={() => {
          setShowNotification(false);
          onNavigateToWealth?.(); // Navigate to Wealth tab or open specific goal detail
        }}
      />
    </div>
  );
}