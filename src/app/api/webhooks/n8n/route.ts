import { NextResponse } from "next/server";

// In-memory buffer of recent inbound events (non-persistent)
const recentEvents: Array<{ ts: number; event: any }> = [];

// n8n -> website inbound webhook receiver
// Configure your n8n workflow to POST events here with header `x-n8n-secret: <N8N_INBOUND_SECRET>`
// Body example: { type: "email.received", data: { from, to, subject, text, html, messageId, threadId } }
export async function POST(req: Request) {
  const sharedSecret = process.env.N8N_INBOUND_SECRET || "";
  const provided = req.headers.get("x-n8n-secret") || "";

  if (sharedSecret && provided !== sharedSecret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let event: any = null;
  try {
    event = await req.json();
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!event || typeof event.type !== "string" || typeof event.data !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid event payload" }, { status: 400 });
  }

  // Buffer last 25 events in memory for quick inspection in the dashboard
  recentEvents.unshift({ ts: Date.now(), event });
  if (recentEvents.length > 25) recentEvents.length = 25;

  // TODO: Integrate with your app: save to DB, emit SSE, trigger notifications, etc.
  // For now we acknowledge the event so n8n can continue the workflow.
  return NextResponse.json({ ok: true });
}

export async function GET() {
  // Simple health-check + return recent events
  return NextResponse.json({ ok: true, message: "n8n webhook up", events: recentEvents.slice(0, 10) });
}