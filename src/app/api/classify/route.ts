import { NextResponse } from "next/server";
import { forwardEvent, COMPANY_EMAIL } from "@/lib/n8n";
import { emitEvent } from "@/lib/events";

export const runtime = "nodejs";

function mockClassification(message: string) {
  const m = message.toLowerCase();
  const categories = [
    m.includes("payment") || m.includes("card") || m.includes("charge")
      ? "billing"
      : undefined,
    m.includes("not loading") || m.includes("error") || m.includes("bug")
      ? "technical"
      : undefined,
    m.includes("refund") || m.includes("cancel") ? "refund" : undefined,
    m.includes("feature") || m.includes("roadmap") ? "product_inquiry" : undefined,
    m.includes("feedback") || m.includes("love") ? "feedback" : undefined,
  ].filter(Boolean) as string[];

  const sentiment = m.includes("angry") || m.includes("frustrated") || m.includes("terrible")
    ? "negative"
    : m.includes("great") || m.includes("love") || m.includes("awesome")
    ? "positive"
    : "neutral";

  let priority: "low" | "medium" | "high" | "urgent" = "medium";
  if (m.includes("compromised") || m.includes("hacked") || m.includes("payment failed")) priority = "urgent";
  else if (m.includes("not loading") || m.includes("down")) priority = "high";

  return { categories, priority, sentiment, entities: [] };
}

export async function POST(req: Request) {
  const { message, channel } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    const result = { source: "mock", ...mockClassification(message) };
    await forwardEvent({
      type: "classification.created",
      data: { channel, message, result, companyEmail: COMPANY_EMAIL },
    });
    // emit SSE event
    emitEvent({ type: "classification.created", data: { channel, message, result, companyEmail: COMPANY_EMAIL } });
    return NextResponse.json(result);
  }

  try {
    const sys = `You are an AI that classifies customer support messages. Return STRICT JSON with keys: categories (array from [\"billing\", \"technical\", \"product_inquiry\", \"feedback\", \"refund\"]), priority (one of low, medium, high, urgent), sentiment (positive, neutral, negative), entities (array of strings). Consider the channel: ${channel}.`;

    const user = `Message: ${message}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      const result = { source: "mock", error: text, ...mockClassification(message) };
      await forwardEvent({
        type: "classification.created",
        data: { channel, message, result, companyEmail: COMPANY_EMAIL },
      });
      emitEvent({ type: "classification.created", data: { channel, message, result, companyEmail: COMPANY_EMAIL } });
      return NextResponse.json(result, { status: 200 });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const json = JSON.parse(content);
    const result = { source: "openai", ...json };
    await forwardEvent({
      type: "classification.created",
      data: { channel, message, result, companyEmail: COMPANY_EMAIL },
    });
    emitEvent({ type: "classification.created", data: { channel, message, result, companyEmail: COMPANY_EMAIL } });
    return NextResponse.json(result);
  } catch (err: any) {
    const result = { source: "mock", error: String(err), ...mockClassification(message) };
    await forwardEvent({
      type: "classification.created",
      data: { channel, message, result, companyEmail: COMPANY_EMAIL },
    });
    emitEvent({ type: "classification.created", data: { channel, message, result, companyEmail: COMPANY_EMAIL } });
    return NextResponse.json(result, { status: 200 });
  }
}