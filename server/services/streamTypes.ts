import type { AdaResponseEnvelope, AdaErrorPayload } from '../../shared/schemas/agent';

export type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'widget'; widget: { type: string; [key: string]: unknown } }
  | { type: 'simulator'; simulator: { type: string; initialValues?: Record<string, number> } }
  | { type: 'suggested_questions'; suggestedQuestions: string[] }
  | { type: 'thinking'; step: string; detail: string }
  | { type: 'meta'; lane: string; intent: string; traceId: string; model: string }
  | { type: 'structured'; envelope: AdaResponseEnvelope }
  | { type: 'structured_error'; error: AdaErrorPayload }
  | { type: 'done' }
  | { type: 'error'; content: string };
