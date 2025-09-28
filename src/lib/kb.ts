export type KBArticle = {
  id: number;
  title: string;
  content: string;
  tags: string[];
};

export const knowledgeBase: KBArticle[] = [
  {
    id: 1,
    title: "Payment Failed Troubleshooting",
    content:
      "If a customer's payment fails, ask them to verify their card details, ensure sufficient funds, and try an alternate payment method. For recurring issues, instruct them to clear cache or use an incognito window. Check our payments status page for known incidents.",
    tags: ["billing", "payment", "card", "checkout"],
  },
  {
    id: 2,
    title: "Account Compromised Recovery Steps",
    content:
      "For suspected account compromise: immediately reset the user's password, invalidate all active sessions, and enable 2FA. Ask security questions to verify identity. Escalate if any unauthorized purchases are detected.",
    tags: ["security", "account", "compromised", "fraud"],
  },
  {
    id: 3,
    title: "App Not Loading - Common Fixes",
    content:
      "If the app is not loading: confirm network connectivity, check our status page for incidents, clear local cache/storage, and update to the latest version. Collect logs if the issue persists and escalate to engineering with device/OS details.",
    tags: ["technical", "performance", "loading", "status"],
  },
  {
    id: 4,
    title: "Refund Policy Overview",
    content:
      "Refunds are available within 30 days for annual plans and 14 days for monthly plans unless otherwise stated. Pro‑rations apply after usage. Direct high‑value disputes to billing specialists.",
    tags: ["billing", "refund", "policy"],
  },
];

export function retrieveRelevantArticles(query: string, limit = 3): KBArticle[] {
  const q = query.toLowerCase();
  return knowledgeBase
    .map((a) => ({
      article: a,
      score:
        (a.title.toLowerCase().includes(q) ? 3 : 0) +
        (a.content.toLowerCase().includes(q) ? 2 : 0) +
        a.tags.reduce((acc, t) => acc + (q.includes(t.toLowerCase()) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.article);
}