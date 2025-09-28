import { NextResponse } from "next/server";
import { forwardEvent, COMPANY_EMAIL } from "@/lib/n8n";
import { emitEvent } from "@/lib/events";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { to, subject = "", body = "", channel = "email", meta = {} } = await req.json();

  // Simulate send (no external provider wired). Forward to n8n for analytics/ROI.
  const payload = {
    from: COMPANY_EMAIL,
    to,
    subject,
    body,
    channel,
    meta,
    status: "queued",
    queuedAt: Date.now(),
  };

  await forwardEvent({ type: "inbox.send", data: payload as any });
  emitEvent({ type: "inbox.send", data: payload as any });

  // Echo back a simple success for the UI
  return NextResponse.json({ ok: true, ...payload });
}

// === Current Task List ===
// 🔄 [1] Audit existing inbox API routes (intake, send) and classify/respond APIs to understand current flow - in_progress
// ⏳ [2] Plan Gmail integration (OAuth/Service Account), environment variables, and webhook/polling strategy - pending
// ⏳ [3] Design real-time updates (SSE) for dashboard metrics and inbox events - pending
// ⏳ [4] Create server routes to ingest Gmail messages into unified inbox and trigger classification + auto-response - pending
// ⏳ [5] Update dashboard to subscribe to SSE and show real-time counts; link to Inbox - pending
// ⏳ [6] Implement Gmail send route to reply back automatically with AI - pending
// ⏳ [7] Add placeholders for chat/social connectors and funnel via same intake route - pending
// ========================