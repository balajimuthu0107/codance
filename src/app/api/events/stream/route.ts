import { NextResponse } from "next/server";
import { onEvent, AppEvent } from "@/lib/events";

export const runtime = "nodejs";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to send an SSE event
      const send = (event: AppEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Initial ping to open the stream
      controller.enqueue(encoder.encode(`: connected\n\n`));

      // Subscribe to app events
      const off = onEvent((evt) => send(evt));

      // Heartbeat to keep the connection alive (every 25s)
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
      }, 25000);

      return () => {
        clearInterval(interval);
        off();
      };
    },
    cancel() {},
  });

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}