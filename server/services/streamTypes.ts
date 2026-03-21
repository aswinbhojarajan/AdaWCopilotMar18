export interface StreamEvent {
  type: 'text' | 'widget' | 'simulator' | 'suggested_questions' | 'done' | 'error';
  content?: string;
  widget?: { type: string; [key: string]: unknown };
  simulator?: { type: string; initialValues?: Record<string, number> };
  suggestedQuestions?: string[];
}
