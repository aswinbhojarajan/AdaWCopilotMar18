import React from 'react';
import { ArrowUp, Mic, ChevronRight } from 'lucide-react';
import svgPaths from '../../imports/svg-npbkfwfylb';

interface BottomBarProps {
  onSubmit?: (value: string) => void;
  onChatHistoryClick?: () => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  isOnChatScreen?: boolean;
}

export function BottomBar({
  onSubmit,
  onChatHistoryClick,
  hasActiveChatToday = false,
  onResumeChat,
  onOpenChat,
  isOnChatScreen = false,
}: BottomBarProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus when on chat screen and no active chat
  React.useEffect(() => {
    if (isOnChatScreen && !hasActiveChatToday) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnChatScreen, hasActiveChatToday]);

  const handleSubmit = () => {
    if (inputValue.trim() && onSubmit) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording logic here
    // This would integrate with browser's Web Speech API or similar
    if (!isRecording) {
      console.log('Started recording...');
    } else {
      console.log('Stopped recording...');
    }
  };

  // Handle click on input area when there's an active chat
  const handleInputAreaClick = () => {
    if (hasActiveChatToday && !isOnChatScreen && onResumeChat) {
      // When not on chat screen but have active chat, resume it
      onResumeChat();
    } else if (!hasActiveChatToday && !isOnChatScreen && onOpenChat) {
      // When not on chat screen and no active chat, open empty chat
      onOpenChat();
    }
    // When on chat screen, do nothing (input is functional)
  };

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      {/* Input Area */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[8px] items-center py-[12px] px-[16px] relative w-full">
            {/* Pill-shaped blur background - centered with consistent padding */}
            <div
              className={`absolute left-[8px] right-[8px] top-0 bottom-0 backdrop-blur-xl rounded-[50px] z-0 transition-all duration-300 ${
                hasActiveChatToday
                  ? 'bg-white/60 shadow-[0_2px_12px_rgba(68,19,22,0.06),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                  : 'bg-gray-100/60 shadow-[0_1px_8px_rgba(68,19,22,0.04),inset_0_1px_2px_rgba(255,255,255,0.3)]'
              }`}
              style={{ WebkitBackdropFilter: 'blur(24px)' } as React.CSSProperties}
            />

            {/* Chat History Button (left side) */}
            <button
              onClick={onChatHistoryClick}
              className="relative shrink-0 size-[44px] z-10 cursor-pointer"
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 44 44"
              >
                <g id="Frame 47755">
                  <rect fill="rgba(255,255,255,0.98)" height="44" rx="22" width="44" />
                  <path d={svgPaths.p80d9900} fill="#555555" id="Vector" />
                </g>
              </svg>
            </button>

            {/* Input Field with Mic or Resume Chat Button */}
            <div
              className={`basis-0 bg-white/95 grow h-[44px] min-h-px min-w-px relative rounded-[23.321px] shrink-0 backdrop-blur-sm z-10 shadow-[0_1px_3px_rgba(68,19,22,0.08)] ${
                !isOnChatScreen ? 'cursor-pointer' : ''
              }`}
              style={{ WebkitBackdropFilter: 'blur(8px)' } as React.CSSProperties}
              onClick={handleInputAreaClick}
            >
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] items-center px-[20px] py-0 relative size-full">
                  {hasActiveChatToday && !isOnChatScreen ? (
                    // Resume chat mode (only show when NOT on chat screen)
                    <div className="flex items-center justify-between w-full">
                      <span className="font-['DM_Sans:Regular',sans-serif] text-[14px] text-[#441316]">
                        Continue today's conversation
                      </span>
                      <ChevronRight className="size-[18px] text-[#441316]" strokeWidth={1.5} />
                    </div>
                  ) : (
                    // Normal input mode
                    <>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Ask anything"
                        className="basis-0 font-['DM_Sans:Regular',sans-serif] grow min-h-px min-w-px not-italic relative shrink-0 text-black bg-transparent border-none outline-none placeholder:opacity-70 text-[14px]"
                        ref={inputRef}
                      />
                      <button
                        onClick={handleVoiceToggle}
                        className="flex items-center justify-center relative shrink-0 transition-colors"
                      >
                        <Mic
                          className={`size-[18px] ${isRecording ? 'text-[#992929]' : 'text-[#555555]'} transition-colors`}
                          strokeWidth={1.5}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Send Button (right side) - only faded when showing "Continue" state */}
            <button
              onClick={hasActiveChatToday && !isOnChatScreen ? undefined : handleSubmit}
              disabled={(hasActiveChatToday && !isOnChatScreen) || !inputValue.trim()}
              className={`relative shrink-0 size-[44px] z-10 rounded-full flex items-center justify-center transition-opacity ${
                hasActiveChatToday && !isOnChatScreen
                  ? 'opacity-30 pointer-events-none'
                  : !inputValue.trim()
                    ? 'opacity-50 cursor-pointer'
                    : 'opacity-100 cursor-pointer'
              }`}
              style={{ backgroundColor: '#441316' }}
            >
              <ArrowUp className="size-[20px] text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] relative shrink-0 w-full">
        <div className="absolute bg-[#555555] bottom-[9px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] translate-x-[-50%] w-[134px]" />
      </div>
    </div>
  );
}
