const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(value = "") {
  return value.replace(/&#(x?[0-9a-f]+);|&([a-z]+);/gi, (_, numeric: string | undefined, named: string | undefined) => {
    if (numeric) return String.fromCodePoint(Number.parseInt(numeric.replace(/^x/i, ""), /^x/i.test(numeric) ? 16 : 10));
    return entities[named?.toLowerCase() ?? ""] ?? `&${named};`;
  });
}

export function plainText(value?: string) {
  return decodeEntities(value?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]*>/g, " ") ?? "").replace(/\s+/g, " ").trim() || undefined;
}

export function xmlElements(xml: string, tag: string) {
  const safeTag = tag.replace(/[^a-z0-9_-]/gi, "");
  return [...xml.matchAll(new RegExp(`<${safeTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safeTag}>`, "gi"))].map((match) => match[1]);
}

export function xmlValue(xml: string, tag: string) {
  return plainText(xmlElements(xml, tag)[0]);
}
