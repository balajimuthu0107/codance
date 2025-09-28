import { forwardEvent } from "@/lib/n8n";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body?.message ?? "").toString().trim();
    const email = body?.email ? String(body.email).trim() : undefined;
    const rating = typeof body?.rating === "number" ? body.rating : undefined;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await forwardEvent({
      type: "feedback.created",
      data: {
        message,
        email,
        rating,
        path: "/",
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}