import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle, Lightbulb, Newspaper, Info, X } from 'lucide-react';
import { SparkIcon } from './SparkIcon';
import { SourcesBadge } from './SourcesBadge';
import { ArticleSourcesSheet } from './ArticleSourcesSheet';
import type { SupportingArticle } from '../../../shared/types';

export type CategoryType =
  | 'PORTFOLIO RISK ALERT'
  | 'MARKET OPPORTUNITY INSIGHT'
  | 'NEWS'
  | 'ACTION ITEM'
  | 'INSIGHT'
  | 'EDUCATIONAL'
  | 'RECOMMENDED READ'
  | 'MARKET ANALYSIS';

interface ContentCardProps {
  id?: string;
  category?: string;
  categoryType?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  isVideo?: boolean;
  timestamp?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  contextTitle?: string;
  onChatSubmit?: (
    message: string,
    context?: { category: string; categoryType: string; title: string; sourceScreen?: string; discoverCard?: { card_id?: string; card_type?: string; card_summary?: string; why_seen?: string; entities?: string[]; evidence_facts?: string[]; cta_family?: string } },
  ) => void;
  customTopic?: string;
  topicLabelColor?: string;
  hideIntent?: boolean;
  sourcesCount?: number;
  detailSections?: Array<{
    title: string;
    type?: string;
    content: string[] | string;
  }>;
  stackButtons?: boolean;
  forceSecondaryButtonStyle?: boolean;
  whyYouAreSeeingThis?: string | null;
  supportingArticles?: SupportingArticle[];
  cardType?: string;
  isNew?: boolean;
  personalizedOverlay?: string | null;
  onDismiss?: (cardId: string) => void;
  onFeedback?: (cardId: string, feedback: string) => void;
  onInteract?: (cardId: string, action: string, metadata?: Record<string, unknown>) => void;
  ctaEntities?: string[];
  ctaEvidenceFacts?: string[];
}

const cardTypeConfig: Record<string, {
  accentColor: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  topic: string;
  intent?: string;
}> = {
  'portfolio_impact': { accentColor: '#d97706', icon: AlertTriangle, topic: 'Portfolio Impact', intent: 'Alert' },
  'trend_brief': { accentColor: '#992929', icon: Lightbulb, topic: 'Trend Brief', intent: 'Analysis' },
  'market_pulse': { accentColor: '#555555', icon: Newspaper, topic: 'Market Pulse', intent: 'Analysis' },
  'explainer': { accentColor: '#555555', icon: Newspaper, topic: 'Explainer', intent: undefined },
  'wealth_planning': { accentColor: '#059669', icon: Lightbulb, topic: 'Wealth Planning', intent: 'Action' },
  'allocation_gap': { accentColor: '#059669', icon: Lightbulb, topic: 'Opportunity', intent: 'Opportunity' },
  'event_calendar': { accentColor: '#555555', icon: Newspaper, topic: 'Event', intent: undefined },
  'ada_view': { accentColor: '#992929', icon: Lightbulb, topic: 'Ada View', intent: 'Insight' },
  'product_opportunity': { accentColor: '#059669', icon: Lightbulb, topic: 'Product', intent: 'Opportunity' },
  'morning_briefing': { accentColor: '#992929', icon: Newspaper, topic: 'Morning Brief', intent: 'Briefing' },
  'milestone': { accentColor: '#d97706', icon: Lightbulb, topic: 'Milestone', intent: 'Achievement' },
};

const categoryConfig: Record<
  CategoryType,
  {
    accentColor: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    topic: string;
    intent?: string;
  }
> = {
  'PORTFOLIO RISK ALERT': {
    accentColor: '#d97706',
    icon: AlertTriangle,
    topic: 'Portfolio Risk',
    intent: 'Alert',
  },
  'MARKET OPPORTUNITY INSIGHT': {
    accentColor: '#059669',
    icon: Lightbulb,
    topic: 'Market Insight',
    intent: 'Opportunity',
  },
  NEWS: {
    accentColor: '#555555',
    icon: Newspaper,
    topic: 'News',
    intent: undefined,
  },
  'ACTION ITEM': {
    accentColor: '#059669',
    icon: Lightbulb,
    topic: 'Action Item',
    intent: 'Action',
  },
  INSIGHT: {
    accentColor: '#059669',
    icon: Lightbulb,
    topic: 'Insight',
    intent: 'Insight',
  },
  EDUCATIONAL: {
    accentColor: '#555555',
    icon: Newspaper,
    topic: 'Educational',
    intent: undefined,
  },
  'RECOMMENDED READ': {
    accentColor: '#555555',
    icon: Newspaper,
    topic: 'Recommended Read',
    intent: undefined,
  },
  'MARKET ANALYSIS': {
    accentColor: '#059669',
    icon: Lightbulb,
    topic: 'Market Analysis',
    intent: 'Analysis',
  },
};

const SWIPE_THRESHOLD = 100;
const DISMISS_VELOCITY = 0.3;

export function ContentCard({
  id,
  category = 'NEWS',
  categoryType,
  title,
  description,
  detailSections,
  image,
  isVideo = false,
  timestamp = '13 min ago',
  buttonText = 'Dive deeper',
  secondaryButtonText,
  onButtonClick,
  onSecondaryButtonClick,
  contextTitle,
  onChatSubmit,
  customTopic,
  topicLabelColor,
  hideIntent,
  sourcesCount,
  stackButtons: _stackButtons,
  forceSecondaryButtonStyle,
  whyYouAreSeeingThis,
  supportingArticles,
  cardType,
  isNew: isNewProp,
  personalizedOverlay,
  onDismiss,
  onFeedback,
  onInteract,
  ctaEntities,
  ctaEvidenceFacts,
}: ContentCardProps) {
  const [showSourcesSheet, setShowSourcesSheet] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(isNewProp ?? false);

  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeOffsetRef = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipingOut, setSwipingOut] = useState(false);
  const swipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isNewVisible || !id || !onInteract) return undefined;
    const el = cardRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.intersectionRatio >= 0.5) {
          setIsNewVisible(false);
          onInteract(id, 'view', { auto_seen: true });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isNewVisible, id, onInteract]);

  const determinedCategoryType =
    (categoryType ||
    (category.toUpperCase().includes('RISK') || category.toUpperCase().includes('ALERT')
      ? 'PORTFOLIO RISK ALERT'
      : category.toUpperCase().includes('OPPORTUNITY') || category.toUpperCase().includes('INSIGHT')
        ? 'MARKET OPPORTUNITY INSIGHT'
        : 'NEWS')) as CategoryType;

  const ctConfig = cardType ? cardTypeConfig[cardType] : undefined;
  const config = ctConfig || categoryConfig[determinedCategoryType] || categoryConfig['NEWS'];
  const accentColor = config.accentColor;
  const _CategoryIcon = config.icon;

  const handleButtonClick = () => {
    if (id && onInteract) {
      onInteract(id, 'cta_tap', { cta_family: 'primary', cta_text: buttonText });
    }
    if (onChatSubmit && buttonText && contextTitle) {
      onChatSubmit(buttonText, {
        category,
        categoryType: determinedCategoryType,
        title: contextTitle,
        sourceScreen: 'Discover',
        discoverCard: id ? {
          card_id: id,
          card_type: cardType,
          card_summary: typeof description === 'string' ? description : contextTitle,
          why_seen: whyYouAreSeeingThis || undefined,
          entities: ctaEntities,
          evidence_facts: ctaEvidenceFacts,
          cta_family: 'primary',
        } : undefined,
      });
    } else if (onButtonClick) {
      onButtonClick();
    }
  };

  const handleSecondaryButtonClick = () => {
    if (id && onInteract) {
      onInteract(id, 'cta_tap', { cta_family: 'secondary', cta_text: secondaryButtonText });
    }
    if (onChatSubmit && secondaryButtonText && contextTitle) {
      onChatSubmit(secondaryButtonText, {
        category,
        categoryType: determinedCategoryType,
        title: contextTitle,
        sourceScreen: 'Discover',
        discoverCard: id ? {
          card_id: id,
          card_type: cardType,
          card_summary: typeof description === 'string' ? description : contextTitle,
          why_seen: whyYouAreSeeingThis || undefined,
          entities: ctaEntities,
          evidence_facts: ctaEvidenceFacts,
          cta_family: 'secondary',
        } : undefined,
      });
    } else if (onSecondaryButtonClick) {
      onSecondaryButtonClick();
    }
  };

  const handleDismiss = () => {
    if (id && onDismiss) {
      setShowFeedback(true);
    }
  };

  const handleFeedbackSubmit = (reason: string) => {
    if (id) {
      onDismiss?.(id);
      onFeedback?.(id, reason);
    }
    setShowFeedback(false);
    setIsDismissed(true);
  };

  const handleDismissWithoutFeedback = () => {
    if (id) {
      onDismiss?.(id);
    }
    setShowFeedback(false);
    setIsDismissed(true);
  };

  const triggerSwipeDismiss = useCallback(() => {
    setSwipingOut(true);
    if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
    swipeTimerRef.current = setTimeout(() => {
      swipeTimerRef.current = null;
      if (id && onDismiss) {
        setShowFeedback(true);
        setSwipingOut(false);
        setSwipeOffset(0);
        swipeOffsetRef.current = 0;
      }
    }, 250);
  }, [id, onDismiss]);

  const resetSwipe = useCallback(() => {
    touchStartRef.current = null;
    setSwipeOffset(0);
    swipeOffsetRef.current = 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!id || !onDismiss) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, [id, onDismiss]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dy) > Math.abs(dx)) {
      resetSwipe();
      return;
    }
    const clamped = Math.min(0, dx);
    swipeOffsetRef.current = clamped;
    setSwipeOffset(clamped);
  }, [resetSwipe]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const elapsed = Math.max(Date.now() - touchStartRef.current.time, 1);
    const offset = swipeOffsetRef.current;
    const velocity = Math.abs(offset) / elapsed;

    if (Math.abs(offset) > SWIPE_THRESHOLD || velocity > DISMISS_VELOCITY) {
      triggerSwipeDismiss();
    } else {
      setSwipeOffset(0);
      swipeOffsetRef.current = 0;
    }
    touchStartRef.current = null;
  }, [triggerSwipeDismiss]);

  const handleTouchCancel = useCallback(() => {
    resetSwipe();
  }, [resetSwipe]);

  if (isDismissed) return null;

  const isNewsType =
    determinedCategoryType === 'NEWS' ||
    determinedCategoryType === 'EDUCATIONAL' ||
    determinedCategoryType === 'RECOMMENDED READ' ||
    (categoryType &&
      typeof categoryType === 'string' &&
      (categoryType.toUpperCase().includes('NEWS') ||
        categoryType.toUpperCase().includes('EDUCATION')));

  if (showFeedback) {
    return (
      <div className="bg-white relative rounded-[30px] shrink-0 w-full">
        <div className="p-[20px]">
          <div className="flex items-center justify-between mb-[12px]">
            <p className="font-['DM_Sans',sans-serif] font-semibold text-[0.875rem] text-[#555555]">
              Why are you dismissing this?
            </p>
            <button onClick={handleDismissWithoutFeedback} className="p-[4px]">
              <X className="size-[16px] text-[#999999]" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-col gap-[8px]">
            {['Not relevant', 'Already know this', 'Too complex', 'Too basic'].map((reason) => (
              <button
                key={reason}
                onClick={() => handleFeedbackSubmit(reason)}
                className="text-left px-[14px] py-[10px] rounded-[12px] border border-[#e8e0e0] font-['DM_Sans',sans-serif] text-[0.8125rem] text-[#555555] hover:bg-[#faf7f7] transition-colors"
              >
                {reason}
              </button>
            ))}
          </div>
          <button
            onClick={handleDismissWithoutFeedback}
            className="mt-[8px] w-full text-center py-[8px] font-['DM_Sans',sans-serif] text-[0.75rem] text-[#999999]"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  const swipeStyle: React.CSSProperties = swipingOut
    ? { transform: 'translateX(-120%)', opacity: 0, transition: 'transform 250ms ease-out, opacity 250ms ease-out' }
    : swipeOffset !== 0
      ? { transform: `translateX(${swipeOffset}px)`, transition: 'none' }
      : { transform: 'translateX(0)', transition: 'transform 200ms ease-out' };

  return (
    <div
      ref={cardRef}
      className="relative shrink-0 w-full overflow-hidden rounded-[30px]"
    >
      {id && onDismiss && swipeOffset < -30 && (
        <div className="absolute inset-0 flex items-center justify-end pr-[24px] rounded-[30px] bg-[#faf5f5]">
          <div className="flex flex-col items-center gap-[4px]">
            <X className="size-[20px] text-[#992929]" strokeWidth={1.5} />
            <p className="font-['DM_Sans',sans-serif] text-[0.625rem] text-[#992929] font-medium">Dismiss</p>
          </div>
        </div>
      )}
      <div
        className="bg-white relative rounded-[30px] shrink-0 w-full"
        style={swipeStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="size-full">
          <div className="content-stretch flex flex-col items-start pb-[20px] pt-[20px] px-[20px] relative w-full">
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-[6px]">
                      {isNewVisible && (
                        <div className="flex items-center justify-center px-[6px] py-[2px] rounded-[4px] bg-[#992929]">
                          <p className="font-['DM_Sans',sans-serif] font-semibold leading-[14px] text-[0.5625rem] tracking-[0.5px] uppercase text-white">
                            New
                          </p>
                        </div>
                      )}
                      {!hideIntent && config.intent && (
                        <div
                          className="flex items-center justify-center px-[8px] py-[2px] rounded-[4px]"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <p
                            className="font-['DM_Sans',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[0.625rem] tracking-[0.8px] uppercase"
                            style={{ color: accentColor }}
                          >
                            {config.intent}
                          </p>
                        </div>
                      )}
                    </div>
                    {id && onDismiss && (
                      <button
                        onClick={handleDismiss}
                        className="p-[4px] -mr-[4px] -mt-[4px] opacity-40 hover:opacity-80 transition-opacity"
                      >
                        <X className="size-[14px] text-[#555555]" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  <p
                    className="font-['DM_Sans',sans-serif] font-semibold h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[0.625rem] tracking-[0.8px] uppercase"
                    style={{ color: topicLabelColor || '#992929' }}
                  >
                    {customTopic || config.topic}
                  </p>

                  <p className="font-['Crimson_Pro',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[1.5rem] tracking-[-0.48px] w-full">
                    {title}
                  </p>

                  {whyYouAreSeeingThis && (
                    <div className="flex items-center gap-[6px] flex-wrap mt-[-2px]">
                      <div className="flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#f5f2f2] border border-[#e8e2e2]">
                        <Info className="size-[10px] text-[#999999] shrink-0" strokeWidth={1.5} />
                        <p className="font-['DM_Sans',sans-serif] text-[0.625rem] text-[#888888] leading-[1.2]">
                          {whyYouAreSeeingThis}
                        </p>
                      </div>
                    </div>
                  )}

                  {supportingArticles && supportingArticles.length > 0 && (
                    <SourcesBadge
                      articles={supportingArticles}
                      onClick={() => setShowSourcesSheet(true)}
                    />
                  )}
                </div>

                {image && (
                  <div className="h-[184px] relative shrink-0 w-full rounded-[8px] overflow-hidden">
                    <img
                      alt=""
                      className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                      src={image}
                    />
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full size-[56px] flex items-center justify-center">
                          <svg className="size-[24px] ml-1" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5v14l11-7L8 5z" fill="#441316" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {personalizedOverlay && (
                  <div className="w-full px-[12px] py-[8px] rounded-[8px] bg-[#faf5f5] border border-[#f0e8e8]">
                    <p className="font-['DM_Sans',sans-serif] text-[0.8125rem] text-[#992929] leading-[1.4] italic">
                      {personalizedOverlay}
                    </p>
                  </div>
                )}

                {description && (
                  <p
                    className="font-['DM_Sans',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[0.875rem] w-full"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    {description}
                  </p>
                )}

                {detailSections && detailSections.length > 0 && (
                  <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                    {detailSections.map((section, index) => (
                      <div
                        key={index}
                        className="font-['DM_Sans',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[0.875rem] w-full"
                        style={{ fontVariationSettings: "'opsz' 14" }}
                      >
                        <p className="font-['DM_Sans',sans-serif] font-semibold leading-[18px] not-italic relative shrink-0 text-[0.625rem] tracking-[0.8px] uppercase">
                          {section.title}
                        </p>
                        {Array.isArray(section.content) ? (
                          <ul className="list-disc mb-0">
                            {section.content.map((item, i) => (
                              <li key={i} className="mb-0 ms-[15px]">
                                <span className="leading-[normal]">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mb-0">{section.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full mt-[12px]">
                  <button
                    onClick={handleButtonClick}
                    className={
                      forceSecondaryButtonStyle || isNewsType
                        ? 'content-stretch flex gap-[6px] h-[48px] items-center justify-start px-[14px] py-[10px] relative rounded-[50px] shrink-0'
                        : 'bg-[#441316] content-stretch flex gap-[6px] h-[48px] items-center justify-start px-[14px] py-[10px] relative rounded-[50px] shrink-0'
                    }
                  >
                    {(forceSecondaryButtonStyle || isNewsType) && (
                      <div
                        aria-hidden="true"
                        className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
                      />
                    )}
                    <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                      <SparkIcon
                        color={forceSecondaryButtonStyle || isNewsType ? '#555555' : '#ffffff'}
                      />
                    </div>
                    <p
                      className={`font-['DM_Sans',sans-serif] leading-[normal] not-italic relative shrink-0 text-[0.75rem] text-nowrap whitespace-pre ${forceSecondaryButtonStyle || isNewsType ? 'text-[#555555]' : 'text-white'}`}
                    >
                      {buttonText}
                    </p>
                  </button>

                  {secondaryButtonText && (
                    <button
                      onClick={handleSecondaryButtonClick}
                      className="content-stretch flex gap-[6px] h-[48px] items-center justify-start px-[14px] py-[10px] relative rounded-[50px] shrink-0"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
                      />
                      <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                        <SparkIcon color="#555555" />
                      </div>
                      <p className="font-['DM_Sans',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[0.75rem] text-nowrap whitespace-pre">
                        {secondaryButtonText}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {supportingArticles && supportingArticles.length > 0 && (
                <ArticleSourcesSheet
                  articles={supportingArticles}
                  isOpen={showSourcesSheet}
                  onClose={() => setShowSourcesSheet(false)}
                />
              )}

              <div className="content-stretch flex gap-[2px] items-center justify-end relative shrink-0 w-full">
                <Clock className="size-[12px] text-[#555555]" strokeWidth={1} />
                <div className="flex flex-col font-['DM_Sans',sans-serif] justify-center not-italic relative shrink-0 text-[#555555] text-[0.5625rem] text-nowrap text-right">
                  <p className="leading-[normal]">{timestamp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
