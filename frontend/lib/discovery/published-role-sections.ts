const RESPONSIBILITY_HEADINGS = [
  "key responsibilities", "responsibilities", "what you'll do", "what you will do",
  "in this role you will", "duties",
];

const REQUIREMENT_HEADINGS = [
  "required qualifications", "minimum qualifications", "qualifications", "requirements",
  "what you bring", "what we're looking for", "what we are looking for", "who you are",
  "you might thrive in this role if", "you'll thrive in this role if",
];

const TERMINAL_HEADINGS = [
  "preferred qualifications", "nice to have", "benefits", "compensation", "salary",
  "about us", "about the company", "equal opportunity", "our culture", "how to apply",
];

type SectionKind = "responsibilities" | "requirements" | "terminal";
type HeadingMatch = { index: number; end: number; kind: SectionKind };

export type PublishedRoleSections = {
  responsibilities: string[];
  requirements: string[];
  travelRequirement?: string;
};

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingMatches(text: string): HeadingMatch[] {
  const definitions: Array<[SectionKind, string[]]> = [
    ["responsibilities", RESPONSIBILITY_HEADINGS],
    ["requirements", REQUIREMENT_HEADINGS],
    ["terminal", TERMINAL_HEADINGS],
  ];
  const matches: HeadingMatch[] = [];
  for (const [kind, headings] of definitions) {
    for (const heading of headings) {
      // Job providers frequently flatten HTML headings into a single line. Accept a
      // label only when it is uppercase, line/punctuation-delimited, or followed by a
      // colon. This preserves flattened headings without mining ordinary prose.
      const expression = new RegExp(`\\b(${escapePattern(heading)})(?=\\s*[:—–-]?\\s+)`, "gi");
      for (const match of text.matchAll(expression)) {
        const label = match[1] ?? "";
        const index = match.index ?? 0;
        const previous = text.slice(Math.max(0, index - 2), index);
        const following = text.slice(index + label.length, index + label.length + 2);
        const headingForm = label === label.toUpperCase() || index === 0 || /\n\s*$/.test(previous) || /^\s*:/.test(following);
        if (!headingForm) continue;
        matches.push({ index, end: index + label.length, kind });
      }
    }
  }
  return matches
    .sort((left, right) => left.index - right.index || right.end - left.end)
    .filter((candidate, index, ordered) => !ordered.slice(0, index).some((prior) => candidate.index >= prior.index && candidate.end <= prior.end));
}

function sectionItems(value: string) {
  const cleaned = value
    .replace(/^\s*[:—–-]\s*/, "")
    .replace(/\r/g, "\n")
    .trim();
  if (!cleaned) return [];
  const explicitItems = cleaned
    .split(/(?:\n\s*(?:[-*•▪◦]|\d+[.)])\s+)|(?:\s+[•▪◦]\s+)|(?:\s+[-–—]\s+(?=[A-Z]))/)
    .map((item) => item.replace(/\s+/g, " ").replace(/[;,.]\s*$/, "").trim())
    .filter((item) => item.length >= 12 && item.length <= 500);
  // Do not infer a list from undifferentiated prose. A single concise published
  // statement is still useful evidence; long narrative text remains only a summary.
  if (explicitItems.length === 1 && explicitItems[0].length > 260) return [];
  return [...new Set(explicitItems)].slice(0, 12);
}

function travelEvidence(items: readonly string[]) {
  const statement = items.find((item) => /\btravel(?:ling|ing)?\b/i.test(item));
  if (!statement) return undefined;
  const percent = statement.match(/\b\d{1,3}\s*%/i)?.[0];
  if (percent) return `${percent} travel (published requirement)`;
  const cadence = statement.match(/\b(?:frequent|regular|occasional|limited|extensive)\s+travel\b/i)?.[0];
  return cadence ? `${cadence} (published requirement)` : "Travel required (published requirement)";
}

/** Extracts only explicitly labelled role sections from employer-published text. */
export function extractPublishedRoleSections(description?: string): PublishedRoleSections {
  if (!description?.trim()) return { responsibilities: [], requirements: [] };
  const matches = headingMatches(description);
  const extract = (kind: Exclude<SectionKind, "terminal">) => {
    const heading = matches.find((match) => match.kind === kind);
    if (!heading) return [];
    const next = matches.find((match) => match.index > heading.index);
    return sectionItems(description.slice(heading.end, next?.index ?? description.length));
  };
  const responsibilities = extract("responsibilities");
  const requirements = extract("requirements");
  return { responsibilities, requirements, travelRequirement: travelEvidence([...responsibilities, ...requirements]) };
}
