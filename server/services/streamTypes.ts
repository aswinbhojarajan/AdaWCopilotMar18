export type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'widget'; widget: { type: string; [key: string]: unknown } }
  | { type: 'simulator'; simulator: { type: string; initialValues?: Record<string, number> } }
  | { type: 'suggested_questions'; suggestedQuestions: string[] }
  | { type: 'thinking'; step: string; detail: string }
  | { type: 'done' }
  | { type: 'error'; content: string };
