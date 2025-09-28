import { NextResponse } from "next/server";
import { retrieveRelevantArticles } from "@/lib/kb";
import { forwardEvent, COMPANY_EMAIL } from "@/lib/n8n";
import { emitEvent } from "@/lib/events";

export const runtime = "nodejs";

function mockResponse(message: string) {
  const articles = retrieveRelevantArticles(message, 2);
  const kbText = articles.map((a) => `- ${a.title}`).join("\n");
  return {
    source: "mock",
    reply:
      `Thanks for reaching out! Based on your message, here are helpful resources:\n${kbText}\n\nIf this doesn't resolve the issue, please share more details and we'll gladly assist further.`,
    articles,
    tone: message.toLowerCase().includes("angry") ? "empathetic" : "professional",
    language: "en",
  };
}

export async function POST(req: Request) {
  const { message, customer, sentiment } = await req.json();

  const articles = retrieveRelevantArticles(message, 3);
  const kbContext = articles.map((a) => `Title: ${a.title}\nContent: ${a.content}`).join("\n---\n");

  // Prefer SIM.AI workflow if key is present
  if (process.env.SIM_AI_API_KEY) {
    try {
      const url = process.env.SIM_AI_WORKFLOW_URL ||
        process.env.SIM_AI_WORKFLOW_ID ||
        "https://www.sim.ai/api/workflows/67eecc2f-3a2c-487d-80ee-d8680b8d939a/execute";

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SIM_AI_API_KEY}`,
        },
        body: JSON.stringify({
          input: { message, customer, sentiment, kbContext },
        }),
      });

      const data: any = await resp.json().catch(() => ({}));
      // Try to normalize various possible response shapes
      const reply =
        data?.reply ??
        data?.output?.reply ??
        data?.result?.reply ??
        data?.data?.reply ??
        (typeof data === "string" ? data : JSON.stringify(data));

      const tone = data?.tone || (String(sentiment || "").toLowerCase().includes("neg") ? "empathetic" : "professional");
      const language = data?.language || "en";

      const result = { source: "sim.ai", articles, reply, tone, language, raw: data };

      await forwardEvent({
        type: "response.drafted",
        data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL },
      });
      emitEvent({ type: "response.drafted", data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL } });

      return NextResponse.json(result, { status: 200 });
    } catch (err: any) {
      const result = { ...mockResponse(message), error: String(err) };
      await forwardEvent({
        type: "response.drafted",
        data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL },
      });
      emitEvent({ type: "response.drafted", data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL } });
      return NextResponse.json(result, { status: 200 });
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    const result = mockResponse(message);
    await forwardEvent({
      type: "response.drafted",
      data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL },
    });
    // emit SSE
    emitEvent({ type: "response.drafted", data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL } });
    return NextResponse.json(result);
  }

  try {
    const sys = `You are a customer support copilot. Write a concise, helpful reply. Use empathetic tone if sentiment is negative. Include concrete steps. If you cite knowledge, it must come from the provided Knowledge Base context. Reply in the customer's language if detectable, else English. Return STRICT JSON with keys: reply (string), tone (string), language (string).`;

    const user = `Customer profile: ${JSON.stringify(customer || {})}\nSentiment: ${sentiment || "unknown"}\nMessage: ${message}\n\nKnowledge Base:\n${kbContext}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      const result = { ...mockResponse(message), error: text };
      await forwardEvent({
        type: "response.drafted",
        data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL },
      });
      emitEvent({ type: "response.drafted", data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL } });
      return NextResponse.json(result, { status: 200 });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    const result = { source: "openai", articles, ...parsed };
    await forwardEvent({
      type: "response.drafted",
      data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL },
    });
    emitEvent({ type: "response.drafted", data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL } });
    return NextResponse.json(result);
  } catch (err: any) {
    const result = { ...mockResponse(message), error: String(err) };
    await forwardEvent({
      type: "response.drafted",
      data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL },
    });
    emitEvent({ type: "response.drafted", data: { message, customer, sentiment, result, companyEmail: COMPANY_EMAIL } });
    return NextResponse.json(result, { status: 200 });
  }
}