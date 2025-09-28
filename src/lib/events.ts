import { EventEmitter } from "events";

// Simple in-memory event bus for real-time updates
const bus = new EventEmitter();

// Increase listeners limit to avoid MaxListeners warning in dev
bus.setMaxListeners(100);

export type AppEvent = {
  type: string;
  data: Record<string, any>;
};

export function emitEvent(event: AppEvent) {
  bus.emit("event", event);
}

export function onEvent(listener: (event: AppEvent) => void) {
  bus.on("event", listener);
  return () => bus.off("event", listener);
}