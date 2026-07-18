export type PublishedCompensation = { minimum?: number; maximum?: number; currency?: string };

const currencyCodes: Record<string, string> = { "US$": "USD", "€": "EUR", "£": "GBP", "C$": "CAD", "A$": "AUD", "CHF": "CHF", "USD": "USD", "EUR": "EUR", "GBP": "GBP", "CAD": "CAD", "AUD": "AUD" };
const context = /\b(?:base\s+(?:pay|salary)|salary|compensation|pay\s+range|annual\s+pay|annual\s+salary)\b/i;
const amount = String.raw`(?:\d{2,3}(?:\.\d+)?\s*[kK]|\d{2,3}(?:[,.]\d{3})+(?:\.\d+)?)`;
const currency = String.raw`US\$|C\$|A\$|\$|€|£|USD|EUR|GBP|CAD|AUD|CHF`;
const rangePatterns = [
  new RegExp(`(?<currency>${currency})\\s*(?<minimum>${amount})\\s*(?:-|–|—|to)\\s*(?:(?<secondCurrency>${currency})\\s*)?(?<maximum>${amount})`, "i"),
  new RegExp(`(?<minimum>${amount})\\s*(?:-|–|—|to)\\s*(?<maximum>${amount})\\s*(?<currency>${currency})`, "i"),
];

function numeric(value: string) {
  const normalized = value.replace(/\s+/g, "").replace(/,/g, "");
  const multiplier = /k$/i.test(normalized) ? 1_000 : 1;
  const parsed = Number(normalized.replace(/k$/i, ""));
  return Number.isFinite(parsed) ? Math.round(parsed * multiplier) : undefined;
}

/** Extracts only an explicit range near compensation language. It never estimates. */
export function extractPublishedCompensation(value?: string): PublishedCompensation | undefined {
  if (!value) return undefined;
  const text = value.normalize("NFKC").replace(/\s+/g, " ");
  for (const pattern of rangePatterns) {
    for (const match of text.matchAll(new RegExp(pattern.source, "gi"))) {
      const index = match.index ?? 0;
      const nearby = text.slice(Math.max(0, index - 120), Math.min(text.length, index + match[0].length + 120));
      if (!context.test(nearby)) continue;
      const currencyToken = match.groups?.currency;
      const first = numeric(match.groups?.minimum ?? "");
      const second = numeric(match.groups?.maximum ?? "");
      if (!currencyToken || first === undefined || second === undefined) continue;
      if (first < 10_000 || second < 10_000 || first > 10_000_000 || second > 10_000_000 || first > second) continue;
      // A bare dollar symbol is globally ambiguous. Preserve the range without inventing a currency.
      return { minimum: first, maximum: second, currency: currencyCodes[currencyToken.toUpperCase()] ?? currencyCodes[currencyToken] };
    }
  }
  return undefined;
}
