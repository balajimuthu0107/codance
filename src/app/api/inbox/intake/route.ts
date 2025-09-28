import { NextResponse } from "next/server";
import { forwardEvent, COMPANY_EMAIL } from "@/lib/n8n";
import { emitEvent } from "@/lib/events";

export const runtime = "nodejs";

// Helper to call internal APIs with a base URL fallback
async function callInternal<T = any>(path: string, body: any): Promise<T> {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const resp = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return resp.json();
}

export async function POST(req: Request) {
  const payload = await req.json();
  const { channel = "email", from, subject = "", message = "" } = payload || {};

  try {
    // Step 1: Classify
    const classification = await callInternal("/api/classify", {
      message,
      channel,
    });

    // Step 2: Draft response
    const draft = await callInternal("/api/respond", {
      message,
      sentiment: classification?.sentiment,
      customer: { email: from },
    });

    // Step 3: Auto-send reply (non-blocking failure)
    let autoSend: any = null;
    try {
      if (from && draft?.reply) {
        autoSend = await callInternal("/api/inbox/send", {
          to: from,
          subject: subject ? `Re: ${subject}` : "Re: Your message",
          body: draft.reply,
          channel,
          meta: { auto: true, classification },
        });
      }
    } catch (_) {
      autoSend = { ok: false, error: "auto-send-failed" };
    }

    const result = {
      intake: {
        channel,
        from,
        subject,
        message,
        companyEmail: COMPANY_EMAIL,
      },
      classification,
      draft,
      autoSend,
    };

    await forwardEvent({
      type: "inbox.intake",
      data: result as any,
    });

    // emit to SSE subscribers
    emitEvent({ type: "inbox.intake", data: result as any });

    return NextResponse.json(result);
  } catch (err: any) {
    const result = { error: String(err), channel, from, subject, companyEmail: COMPANY_EMAIL };
    await forwardEvent({ type: "inbox.intake.error", data: result as any });
    emitEvent({ type: "inbox.intake.error", data: result as any });
    return NextResponse.json(result, { status: 200 });
  }
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