import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  // Mock real-time analytics
  const now = Date.now();
  const seed = Math.floor(now / 60000); // changes roughly every minute
  function rnd(min: number, max: number) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1) + min);
  }

  const responseTimeSeconds = Math.max(20, rnd(20, 60));
  const humanResponseSeconds = 4 * 60 * 60; // 4 hours
  const aiResponseSeconds = responseTimeSeconds;
  const costPerTicketHuman = 3.5;
  const costPerTicketAI = 0.35;
  const ticketsToday = rnd(120, 320);
  const resolvedToday = rnd(90, ticketsToday);
  const csat = rnd(78, 96);
  const fcr = rnd(75, 90); // first contact resolution
  const prevented = rnd(20, 100);

  const roi = ((costPerTicketHuman - costPerTicketAI) * resolvedToday).toFixed(2);

  return NextResponse.json({
    responseTimeSeconds,
    aiResponseSeconds,
    humanResponseSeconds,
    ticketsToday,
    resolvedToday,
    csat,
    fcr,
    prevented,
    roiSavingsUSD: Number(roi),
    series: Array.from({ length: 24 }).map((_, i) => ({
      hour: i,
      tickets: rnd(2, 30),
      resolutionRate: rnd(60, 98),
      avgResponse: rnd(20, 120),
    })),
  });
}