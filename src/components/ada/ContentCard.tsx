import React from 'react';
import { Clock, AlertTriangle, Lightbulb, Newspaper } from 'lucide-react';
import { SparkIcon } from './SparkIcon';
import { SourcesBadge } from './SourcesBadge';

interface DetailSection {
  title: string;
  content: string | string[]; // Can be a paragraph or array of bullet points
}

export type CategoryType = 'PORTFOLIO RISK ALERT' | 'MARKET OPPORTUNITY INSIGHT' | 'NEWS' | 'ACTION ITEM' | 'INSIGHT' | 'EDUCATIONAL' | 'RECOMMENDED READ' | 'MARKET ANALYSIS';

interface ContentCardProps {
  category?: string;
  categoryType?: string; // Accept any string to support custom category types from Discover screen
  title: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  timestamp?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  contextTitle?: string; // Concise provenance label for chat context
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
  customTopic?: string;
  topicLabelColor?: string;
  hideIntent?: boolean;
  sourcesCount?: number;
  detailSections?: Array<{
    title: string;
    content: string[] | string;
  }>;
  stackButtons?: boolean;
  forceSecondaryButtonStyle?: boolean; // Force all buttons to use secondary styling
}

// Category configuration
const categoryConfig: Record<CategoryType, { accentColor: string; icon: any; topic: string; intent?: string }> = {
  'PORTFOLIO RISK ALERT': {
    accentColor: '#d97706', // vibrant amber/orange
    icon: AlertTriangle,
    topic: 'Portfolio Risk',
    intent: 'Alert',
  },
  'MARKET OPPORTUNITY INSIGHT': {
    accentColor: '#059669', // vibrant emerald green
    icon: Lightbulb,
    topic: 'Market Insight',
    intent: 'Opportunity',
  },
  'NEWS': {
    accentColor: '#555555', // neutral gray
    icon: Newspaper,
    topic: 'News',
    intent: undefined, // no intent badge for news
  },
  'ACTION ITEM': {
    accentColor: '#059669', // vibrant emerald green
    icon: Lightbulb,
    topic: 'Action Item',
    intent: 'Action',
  },
  'INSIGHT': {
    accentColor: '#059669', // vibrant emerald green
    icon: Lightbulb,
    topic: 'Insight',
    intent: 'Insight',
  },
  'EDUCATIONAL': {
    accentColor: '#555555', // neutral gray
    icon: Newspaper,
    topic: 'Educational',
    intent: undefined,
  },
  'RECOMMENDED READ': {
    accentColor: '#555555', // neutral gray
    icon: Newspaper,
    topic: 'Recommended Read',
    intent: undefined,
  },
  'MARKET ANALYSIS': {
    accentColor: '#059669', // vibrant emerald green
    icon: Lightbulb,
    topic: 'Market Analysis',
    intent: 'Analysis',
  },
};

export function ContentCard({
  category = "NEWS",
  categoryType,
  title,
  description,
  detailSections,
  image,
  timestamp = "13 min ago",
  buttonText = "Dive deeper",
  secondaryButtonText,
  onButtonClick,
  onSecondaryButtonClick,
  contextTitle,
  onChatSubmit,
  customTopic,
  topicLabelColor,
  hideIntent,
  sourcesCount,
  stackButtons,
  forceSecondaryButtonStyle
}: ContentCardProps) {
  // Determine category type from category string if not explicitly provided
  const determinedCategoryType: CategoryType = categoryType || 
    (category.toUpperCase().includes('RISK') || category.toUpperCase().includes('ALERT') ? 'PORTFOLIO RISK ALERT' :
     category.toUpperCase().includes('OPPORTUNITY') || category.toUpperCase().includes('INSIGHT') ? 'MARKET OPPORTUNITY INSIGHT' :
     'NEWS');
  
  // Get config with fallback to NEWS if category type is not found
  const config = categoryConfig[determinedCategoryType] || categoryConfig['NEWS'];
  const accentColor = config.accentColor;
  const CategoryIcon = config.icon;
  
  // Create wrapped handlers that pass context if onChatSubmit is provided
  const handleButtonClick = () => {
    if (onChatSubmit && buttonText && contextTitle) {
      onChatSubmit(buttonText, {
        category,
        categoryType: determinedCategoryType,
        title: contextTitle,
        sourceScreen: 'Discover'
      });
    } else if (onButtonClick) {
      onButtonClick();
    }
  };
  
  const handleSecondaryButtonClick = () => {
    if (onChatSubmit && secondaryButtonText && contextTitle) {
      onChatSubmit(secondaryButtonText, {
        category,
        categoryType: determinedCategoryType,
        title: contextTitle,
        sourceScreen: 'Discover'
      });
    } else if (onSecondaryButtonClick) {
      onSecondaryButtonClick();
    }
  };
  
  // Determine if this is a news-type card that should use secondary button styling
  // Includes: NEWS, EDUCATIONAL, RECOMMENDED READ, and also checks for "NEWS" or "EDUCATION" in the original category string
  const isNewsType = determinedCategoryType === 'NEWS' || 
                     determinedCategoryType === 'EDUCATIONAL' || 
                     determinedCategoryType === 'RECOMMENDED READ' ||
                     (categoryType && typeof categoryType === 'string' && (categoryType.toUpperCase().includes('NEWS') || categoryType.toUpperCase().includes('EDUCATION')));
  
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[20px] pt-[20px] px-[20px] relative w-full">
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            {/* Content */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              {/* Header Section */}
              <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                {/* Intent badge above topic label */}
                {!hideIntent && config.intent && (
                  <div 
                    className="flex items-center justify-center px-[8px] py-[2px] rounded-[4px]"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <p 
                      className="font-['DM_Sans:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[10px] tracking-[0.8px] uppercase"
                      style={{ color: accentColor }}
                    >
                      {config.intent}
                    </p>
                  </div>
                )}
                
                {/* Topic label */}
                <p 
                  className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase"
                  style={{ color: topicLabelColor || '#992929' }}
                >
                  {customTopic || config.topic}
                </p>
                
                {/* Title */}
                <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                  {title}
                </p>
                
                {/* Sources Badge */}
                {sourcesCount && (
                  <SourcesBadge sourcesCount={sourcesCount} />
                )}
              </div>
              
              {/* Image */}
              {image && (
                <div className="h-[184px] relative shrink-0 w-full rounded-[8px] overflow-hidden">
                  <img 
                    alt="" 
                    className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
                    src={image} 
                  />
                  {/* Video Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full size-[56px] flex items-center justify-center">
                      <svg className="size-[24px] ml-1" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7L8 5z" fill="#441316"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Description */}
              {description && (
                <p 
                  className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full" 
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {description}
                </p>
              )}
              
              {/* Detail Sections */}
              {detailSections && detailSections.length > 0 && (
                <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                  {detailSections.map((section, index) => (
                    <div 
                      key={index}
                      className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[10px] tracking-[0.8px] uppercase">
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
              
              {/* Buttons */}
              <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full mt-[12px]">
                <button 
                  onClick={handleButtonClick}
                  className={forceSecondaryButtonStyle || isNewsType ? "content-stretch flex gap-[6px] h-[44px] items-center justify-start px-[14px] py-[10px] relative rounded-[50px] shrink-0" : "bg-[#441316] content-stretch flex gap-[6px] h-[44px] items-center justify-start px-[14px] py-[10px] relative rounded-[50px] shrink-0"}
                >
                  {(forceSecondaryButtonStyle || isNewsType) && (
                    <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
                  )}
                  <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                    <SparkIcon color={forceSecondaryButtonStyle || isNewsType ? "#555555" : "#ffffff"} />
                  </div>
                  <p className={`font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-nowrap whitespace-pre ${forceSecondaryButtonStyle || isNewsType ? 'text-[#555555]' : 'text-white'}`}>
                    {buttonText}
                  </p>
                </button>
                
                {secondaryButtonText && (
                  <button 
                    onClick={handleSecondaryButtonClick}
                    className="content-stretch flex gap-[6px] h-[44px] items-center justify-start px-[14px] py-[10px] relative rounded-[50px] shrink-0"
                  >
                    <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
                    <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                      <SparkIcon color="#555555" />
                    </div>
                    <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
                      {secondaryButtonText}
                    </p>
                  </button>
                )}
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="content-stretch flex gap-[2px] items-center justify-end relative shrink-0 w-full">
              <Clock className="size-[12px] text-[#555555]" strokeWidth={1} />
              <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap text-right">
                <p className="leading-[normal]">{timestamp}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}