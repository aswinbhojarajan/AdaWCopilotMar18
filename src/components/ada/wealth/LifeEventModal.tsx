import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Baby, Home, Gift, Briefcase, Heart, Loader2 } from 'lucide-react';
import type { LifeEventType, LifeEventSuggestionResponse } from '../../../types';

interface LifeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventType: LifeEventType) => void;
  suggestions: LifeEventSuggestionResponse[];
  isLoading: boolean;
  onConfirmSuggestion: (suggestion: LifeEventSuggestionResponse) => void;
}

const LIFE_EVENTS: { type: LifeEventType; label: string; icon: React.ReactNode }[] = [
  { type: 'new_baby', label: 'New baby', icon: <Baby className="size-[20px]" strokeWidth={1.5} /> },
  { type: 'home_purchase', label: 'Home purchase', icon: <Home className="size-[20px]" strokeWidth={1.5} /> },
  { type: 'inheritance', label: 'Inheritance', icon: <Gift className="size-[20px]" strokeWidth={1.5} /> },
  { type: 'job_change', label: 'Job change', icon: <Briefcase className="size-[20px]" strokeWidth={1.5} /> },
  { type: 'marriage', label: 'Marriage', icon: <Heart className="size-[20px]" strokeWidth={1.5} /> },
];

export function LifeEventModal({
  isOpen,
  onClose,
  onSubmit,
  suggestions,
  isLoading,
  onConfirmSuggestion,
}: LifeEventModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<LifeEventType | null>(null);

  const handleSubmit = () => {
    if (selectedEvent) {
      onSubmit(selectedEvent);
    }
  };

  const handleClose = () => {
    setSelectedEvent(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="LIFE EVENT" subtitle="Log a major life change">
      <div className="px-[24px] py-[20px] flex flex-col gap-[20px]">
        {suggestions.length === 0 && !isLoading ? (
          <>
            <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.875rem] leading-[1.5]">
              Select a life event and Ada will suggest financial goals tailored to your situation.
            </p>
            <div className="flex flex-col gap-[8px]">
              {LIFE_EVENTS.map((event) => (
                <button
                  key={event.type}
                  onClick={() => setSelectedEvent(event.type)}
                  className={`flex items-center gap-[12px] px-[16px] py-[14px] rounded-[12px] border transition-colors w-full text-left ${
                    selectedEvent === event.type
                      ? 'border-[#992929] bg-[#fdf5f5]'
                      : 'border-[#e5e5e5] hover:border-[#ccc]'
                  }`}
                >
                  <div className="shrink-0 text-[#555555]">{event.icon}</div>
                  <span className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.9375rem]">
                    {event.label}
                  </span>
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!selectedEvent}
            >
              Get suggestions
            </Button>
          </>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-[12px] py-[32px]">
            <Loader2 className="size-[28px] text-[#992929] animate-spin" />
            <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.875rem]">
              Ada is thinking...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px]">
            <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.875rem] leading-[1.5]">
              Based on your life event, Ada suggests these goals:
            </p>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex flex-col gap-[12px] p-[16px] border border-[#e5e5e5] rounded-[12px]"
              >
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans',sans-serif] font-semibold text-[#555555] text-[0.9375rem]">
                    {suggestion.title}
                  </p>
                  <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.8125rem] opacity-60">
                    Target: ${suggestion.targetAmount.toLocaleString()} by {suggestion.deadline}
                  </p>
                </div>
                <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.8125rem] leading-[1.4]">
                  {suggestion.rationale}
                </p>
                <Button
                  variant="ai-primary"
                  size="sm"
                  onClick={() => onConfirmSuggestion(suggestion)}
                >
                  Set up this goal
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="md" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
