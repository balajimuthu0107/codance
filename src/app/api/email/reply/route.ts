import { NextResponse } from "next/server";
import { forwardEvent } from "@/lib/n8n";

// POST /api/email/reply
// Body: { threadId: string; html?: string; text?: string; to?: string | string[]; cc?: string[]; bcc?: string[] }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { threadId, html, text, to, cc, bcc } = body || {};

    if (!threadId || (!html && !text)) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: threadId and one of html or text" },
        { status: 400 }
      );
    }

    await forwardEvent({
      type: "email.reply",
      data: { threadId, html, text, to, cc, bcc },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}