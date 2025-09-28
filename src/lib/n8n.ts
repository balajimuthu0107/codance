export const COMPANY_EMAIL = "teamcodance@gmail.com";

/**
 * Forward any event payload to an optional n8n webhook if configured.
 * No-ops if N8N_WEBHOOK_URL is not set.
 */
export async function forwardEvent(event: {
  type: string;
  data: Record<string, any>;
}) {
  try {
    const url = process.env.N8N_WEBHOOK_URL;
    if (!url) return;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "cupid-ai",
        companyEmail: COMPANY_EMAIL,
        timestamp: Date.now(),
        ...event,
      }),
    });
  } catch (_) {
    // Ignore webhook errors to keep UX responsive
  }
}