import { NextResponse } from "next/server";
import { forwardEvent } from "@/lib/n8n";

// POST /api/email/send
// Body: { to: string | string[]; subject: string; html?: string; text?: string; cc?: string[]; bcc?: string[]; threadId?: string; replyTo?: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, text, cc, bcc, threadId, replyTo } = body || {};

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: to, subject, and one of html or text" },
        { status: 400 }
      );
    }

    await forwardEvent({
      type: "email.send",
      data: { to, subject, html, text, cc, bcc, threadId, replyTo },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}