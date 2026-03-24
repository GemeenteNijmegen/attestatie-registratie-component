import { EventHandler, EventMap } from '../schemas';

export type EventListeners = { [K in keyof EventMap]?: EventHandler<EventMap[K]>[] };

/**
 * Base class for all ARC components.
 *
 * Provides a typed, async-safe event system. ARC injects a shared listener
 * registry so all components emit and listen on the same bus.
 * Handler failures are silently caught so they never break the emitting
 * component's flow.
 */
export abstract class Base {
  private _listeners: EventListeners = {};

  /** @internal Called by ARC to share the event bus and initialize the component. */
  init(listeners: EventListeners): void {
    this._listeners = listeners;
    this.onInit();
  }

  /** Override to register event listeners after the event bus is available. */
  protected onInit(): void {}

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event]!.push(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this._listeners[event];
    if (handlers) {
      this._listeners[event] = handlers.filter(h => h !== handler) as typeof handlers;
    }
  }

  protected async emit<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
    const handlers = this._listeners[event];
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(data);
        } catch {
          // Handler failure must not break the emitting component's flow
        }
      }
    }
  }
}
