export interface HookEvent {
  type?: string;
  action?: string;
  context?: Record<string, unknown>;
  sessionKey?: string;
  [key: string]: unknown;
}

export type HookHandler<T extends HookEvent = HookEvent> = (
  event: T,
) => Promise<void> | void;
