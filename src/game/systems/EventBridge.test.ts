import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import eventBridge from './EventBridge';

describe('EventBridge', () => {
  beforeEach(() => {
    eventBridge.removeAllListeners();
  });

  it('on registers a listener and emit delivers the payload', () => {
    let received: { timestamp: number } | null = null;
    eventBridge.on('placeholder:ping', (payload) => {
      received = payload;
    });
    eventBridge.emit('placeholder:ping', { timestamp: 42 });
    expect(received).toEqual({ timestamp: 42 });
  });

  it('off removes a listener so it no longer receives events', () => {
    let count = 0;
    const handler = (): void => { count++; };
    eventBridge.on('placeholder:ping', handler);
    eventBridge.emit('placeholder:ping', { timestamp: 1 });
    expect(count).toBe(1);
    eventBridge.off('placeholder:ping', handler);
    eventBridge.emit('placeholder:ping', { timestamp: 2 });
    expect(count).toBe(1);
  });

  it('removeAllListeners clears all subscriptions', () => {
    let count = 0;
    eventBridge.on('placeholder:ping', () => { count++; });
    eventBridge.removeAllListeners();
    eventBridge.emit('placeholder:ping', { timestamp: 1 });
    expect(count).toBe(0);
  });

  it('emit with no listeners does not throw', () => {
    expect(() => {
      eventBridge.emit('placeholder:ping', { timestamp: 1 });
    }).not.toThrow();
  });

  it('off with unregistered handler does not throw', () => {
    const handler = (): void => {};
    expect(() => {
      eventBridge.off('placeholder:ping', handler);
    }).not.toThrow();
  });

  it('multiple listeners receive the same event', () => {
    const results: number[] = [];
    eventBridge.on('placeholder:ping', (p) => { results.push(p.timestamp); });
    eventBridge.on('placeholder:ping', (p) => { results.push(p.timestamp * 2); });
    eventBridge.emit('placeholder:ping', { timestamp: 5 });
    expect(results).toContain(5);
    expect(results).toContain(10);
  });

  /**
   * Property 1: Event Bridge payload round-trip preservation
   *
   * For any valid event payload conforming to the EventMap type,
   * emitting the event through the EventBridge and receiving it on a
   * registered listener SHALL deliver a payload that is deeply equal
   * to the original.
   *
   * **Validates: Requirements 4.2, 4.3, 4.7**
   */
  it('property: payload round-trip preservation', () => {
    fc.assert(
      fc.property(
        fc.record({ timestamp: fc.double({ noNaN: false }) }),
        (payload) => {
          let received: { timestamp: number } | null = null;
          const handler = (p: { timestamp: number }): void => {
            received = p;
          };
          eventBridge.on('placeholder:ping', handler);
          eventBridge.emit('placeholder:ping', payload);
          eventBridge.off('placeholder:ping', handler);

          if (Number.isNaN(payload.timestamp)) {
            return received !== null && Number.isNaN((received as { timestamp: number }).timestamp);
          }
          return JSON.stringify(received) === JSON.stringify(payload);
        },
      ),
      { numRuns: 100 },
    );
  });
});
