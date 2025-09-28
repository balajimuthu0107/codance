import { NextResponse } from "next/server";

const PROJECT_ID = "ef7a2c1a-9229-4040-8874-2eab7e7b4215";
const API_BASE = "https://api.orchids.app";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = (url.searchParams.get("mode") || "prompt").toLowerCase();

    const apiKey = process.env.NEXT_PUBLIC_ORCHIDS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_ORCHIDS_API_KEY in environment" },
        { status: 500 }
      );
    }

    let endpoint = "";
    let body: any = {};

    if (mode === "messages") {
      endpoint = `${API_BASE}/v1/projects/${PROJECT_ID}/chat`;
      body = {
        messages: [{ role: "user", content: "Hello from test" }],
      };
    } else {
      // default to prompt mode
      endpoint = `${API_BASE}/v1/projects/${PROJECT_ID}/message`;
      body = { input: "Hello from test" };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Upstream request failed", status: res.status, data },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}