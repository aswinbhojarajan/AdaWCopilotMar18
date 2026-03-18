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
  ContentCard,
} from '../ada';
import { Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import type { PollQuestion, PeerComparison } from '../../types';

interface CollectiveScreenProps {
  onChatHistoryClick?: () => void;
  onNotificationsClick?: () => void;
  onChatSubmit?: (
    message: string,
    context?: { category: string; categoryType: string; title: string; sourceScreen?: string },
  ) => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  onPollVote?: () => void;
  onNavigateToWealth?: () => void;
  onClose?: () => void;
}

function CollectiveSkeleton() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
      <div className="bg-white rounded-[30px] w-full p-6 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
      <div className="bg-white rounded-[30px] w-full p-6 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-[100px] bg-gray-200 rounded w-full" />
      </div>
      <div className="bg-white rounded-[30px] w-full p-6 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-[120px] bg-gray-200 rounded w-full" />
      </div>
      <div className="bg-white rounded-[30px] w-full p-6 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[40px] bg-gray-200 rounded w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

export function CollectiveScreen({
  onChatHistoryClick,
  onNotificationsClick,
  onChatSubmit,
  hasActiveChatToday,
  onResumeChat,
  onOpenChat,
  onPollVote,
  onNavigateToWealth,
  onClose,
}: CollectiveScreenProps = {}) {
  const [hasVoted, setHasVoted] = React.useState(false);
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [showNotification, setShowNotification] = React.useState(false);
  const [votingInProgress, setVotingInProgress] = React.useState(false);

  const { data: polls, loading: loadingPolls, refetch: refetchPolls } = useApi<PollQuestion[]>('/api/polls');
  const { data: peerComparisons, loading: loadingPeers } = useApi<PeerComparison[]>('/api/collective/peers');

  const loading = loadingPolls || loadingPeers;
  const poll = polls?.[0];

  React.useEffect(() => {
    if (poll?.userVote) {
      setHasVoted(true);
      setSelectedOptionId(poll.userVote);
    }
  }, [poll?.userVote]);

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleVote = async (optionId: string) => {
    if (!poll || votingInProgress) return;
    setVotingInProgress(true);
    setSelectedOptionId(optionId);
    setHasVoted(true);
    onPollVote?.();

    try {
      await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      refetchPolls();
    } catch {
      // vote still shows locally
    } finally {
      setVotingInProgress(false);
    }

    setTimeout(() => {
      setShowNotification(true);
    }, 1500);
  };

  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
  };

  const getPercentage = (optionId: string) => {
    if (!poll) return 0;
    const total = getTotalVotes();
    if (total === 0) return 0;
    const option = poll.options.find((o) => o.id === optionId);
    return option ? Math.round((option.voteCount / total) * 100) : 0;
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="collective" onTabChange={() => {}} />
      </div>

      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
        {loading ? (
          <CollectiveSkeleton />
        ) : (
          <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
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

            {peerComparisons && peerComparisons.length > 0 && (
              <div className="bg-white relative rounded-[30px] shrink-0 w-full">
                <div className="size-full">
                  <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
                    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                        <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                          <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                            <p className="font-['DM_Sans:SemiBold',sans-serif] h-[14px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                              Investors like you
                            </p>
                          </div>
                          <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                            You allocate more to stocks than 68% of similar investors
                          </p>
                          <p
                            className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[12px] w-full"
                            style={{ fontVariationSettings: "'opsz' 14" }}
                          >
                            Average portfolio allocation comparison
                          </p>
                        </div>

                        <div className="bg-[#f7f6f2] overflow-clip relative rounded-[8px] shrink-0 w-full p-4">
                          <div className="flex flex-col gap-[16px]">
                            {peerComparisons.map((item) => (
                              <div key={item.assetClass} className="flex flex-col gap-[4px]">
                                <div className="flex items-center justify-between">
                                  <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">
                                    {item.assetClass}
                                  </p>
                                  <div className="flex gap-[12px]">
                                    <p className="font-['DM_Sans:Medium',sans-serif] text-[12px] text-[#992929]">
                                      You: {item.userPercent}%
                                    </p>
                                    <p className="font-['DM_Sans:Regular',sans-serif] text-[12px] text-[#555555] opacity-60">
                                      Peers: {item.peerPercent}%
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-[2px] h-[24px]">
                                  <div
                                    className="rounded-[2px]"
                                    style={{ width: `${item.userPercent}%`, backgroundColor: item.color }}
                                  />
                                  <div
                                    className="bg-[#441316] opacity-30 rounded-[2px]"
                                    style={{ width: `${item.peerPercent}%` }}
                                  />
                                  <div className="flex-1" />
                                </div>
                              </div>
                            ))}

                            <div className="flex gap-[16px] items-center justify-center pt-[8px] border-t border-[#555555] border-opacity-20">
                              <div className="flex gap-[6px] items-center">
                                <div className="w-[12px] h-[12px] bg-[#a87174] rounded-[2px]" />
                                <p className="font-['DM_Sans:Regular',sans-serif] text-[10px] text-[#555555]">
                                  Your allocation
                                </p>
                              </div>
                              <div className="flex gap-[6px] items-center">
                                <div className="w-[12px] h-[12px] bg-[#441316] opacity-30 rounded-[2px]" />
                                <p className="font-['DM_Sans:Regular',sans-serif] text-[10px] text-[#555555]">
                                  Peer average
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                          <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
                            Your higher stock allocation positions you for stronger long-term growth
                            potential.
                          </p>
                          <p className="font-['DM_Sans:Light',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
                            This positioning can enhance upside potential while accepting slightly
                            higher short-term volatility.
                          </p>
                        </div>

                        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                          <Button
                            variant="ai-chat"
                            onClick={() =>
                              onChatSubmit?.('Show me a simple scenario', {
                                category: 'COLLECTIVE INSIGHT',
                                categoryType: 'MARKET ANALYSIS',
                                title: 'Higher stock allocation vs peers',
                                sourceScreen: 'collective',
                              })
                            }
                          >
                            Show me a simple scenario
                          </Button>
                          <Button
                            variant="ai-chat"
                            onClick={() =>
                              onChatSubmit?.('What does this mean over time?', {
                                category: 'COLLECTIVE INSIGHT',
                                categoryType: 'MARKET ANALYSIS',
                                title: 'Higher stock allocation vs peers',
                                sourceScreen: 'collective',
                              })
                            }
                          >
                            What does this mean over time?
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {poll && (
              <div className="bg-white relative rounded-[30px] shrink-0 w-full">
                <div className="size-full">
                  <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
                    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                        <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                          <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                            <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                              COMMUNITY PULSE
                            </p>
                          </div>
                          <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                            {poll.question}
                          </p>
                          <p
                            className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full"
                            style={{ fontVariationSettings: "'opsz' 14" }}
                          >
                            Vote to see where sentiment is strongest and how you compare to the
                            community.
                          </p>
                        </div>

                        {hasVoted ? (
                          <div className="bg-[#f7f6f2] overflow-clip relative rounded-[8px] shrink-0 w-full p-4">
                            <div className="flex flex-col gap-[16px]">
                              {poll.options.map((option) => (
                                <PollOption
                                  key={option.id}
                                  name={`poll-${poll.id}`}
                                  value={option.id}
                                  label={option.label}
                                  onChange={() => handleVote(option.id)}
                                  checked={selectedOptionId === option.id}
                                  showResults={hasVoted}
                                  percentage={getPercentage(option.id)}
                                  isUserSelection={selectedOptionId === option.id}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                            {poll.options.map((option) => (
                              <PollOption
                                key={option.id}
                                name={`poll-${poll.id}`}
                                value={option.id}
                                label={option.label}
                                onChange={() => handleVote(option.id)}
                                checked={selectedOptionId === option.id}
                                showResults={hasVoted}
                                percentage={getPercentage(option.id)}
                                isUserSelection={selectedOptionId === option.id}
                              />
                            ))}
                          </div>
                        )}

                        <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] relative shrink-0 text-[#555555] text-[12px] opacity-60 w-full">
                          {hasVoted ? 'Thank you for voting' : 'View results after you vote'}
                        </p>
                      </div>

                      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                        <Button
                          variant="ai-chat"
                          onClick={() =>
                            onChatSubmit?.('Compare regional opportunities for my portfolio', {
                              category: 'COMMUNITY PULSE',
                              categoryType: 'MARKET ANALYSIS',
                              title: 'Regional investment confidence poll',
                              sourceScreen: 'collective',
                            })
                          }
                        >
                          Compare regional opportunities for my portfolio
                        </Button>
                        <Button
                          variant="ai-chat"
                          onClick={() =>
                            onChatSubmit?.('Show me emerging regions to watch', {
                              category: 'COMMUNITY PULSE',
                              categoryType: 'MARKET ANALYSIS',
                              title: 'Regional investment confidence poll',
                              sourceScreen: 'collective',
                            })
                          }
                        >
                          Show me emerging regions to watch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar
          onSubmit={onChatSubmit}
          onChatHistoryClick={onChatHistoryClick}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={onResumeChat}
          onOpenChat={onOpenChat}
        />
      </div>

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
          onNavigateToWealth?.();
        }}
      />
    </div>
  );
}
