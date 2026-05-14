import type { EventMap } from '../types/events';

type Handler<T> = (payload: T) => void;

/**
 * Typed event bridge for bidirectional communication between
 * Phaser scenes and React components.
 *
 * Internal-only — never exposed to window or global scope.
 */
class EventBridgeImpl {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<string, Set<(payload: any) => void>>();

  emit<K extends keyof EventMap>(
    ...args: EventMap[K] extends undefined
      ? [event: K] | [event: K, payload: undefined]
      : [event: K, payload: EventMap[K]]
  ): void {
    const [event, payload] = args;
    const handlers = this.listeners.get(event as string);
    if (!handlers) return;
    handlers.forEach((handler) => {
      handler(payload);
    });
  }

  on<K extends keyof EventMap>(
    event: K,
    handler: Handler<EventMap[K]>,
  ): void {
    const key = event as string;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(handler as (payload: unknown) => void);
  }

  off<K extends keyof EventMap>(
    event: K,
    handler: Handler<EventMap[K]>,
  ): void {
    const handlers = this.listeners.get(event as string);
    if (!handlers) return;
    handlers.delete(handler as (payload: unknown) => void);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/** Singleton EventBridge instance */
const eventBridge = new EventBridgeImpl();
export default eventBridge;
