export type Confidence = "High" | "Medium" | "Low" | "Unknown";

export interface StructuredResumeSections {
  profile: { fullName?: string; headline?: string; summary?: string; citizenship?: string; contact?: string; linkedin?: string; confidence: Confidence };
  highlights: string[];
  education: Array<{ institution: string; qualification?: string; fieldOfStudy?: string; minor?: string; startYear?: string; endYear?: string; description?: string; evidence: string; confidence: Confidence }>;
  languages: Array<{ language: string; proficiency?: string; native?: boolean; evidence: string; confidence: Confidence }>;
  skills: Array<{ name: string; category: string; evidence: string; confidence: Confidence }>;
  certifications: Array<{ name: string; issuer?: string; year?: string; evidence: string; confidence: Confidence }>;
}

const headings = ["EXECUTIVE PROFILE", "PROFESSIONAL SUMMARY", "SUMMARY", "CAREER HIGHLIGHTS", "SELECTED LEADERSHIP VALUE", "PROFESSIONAL EXPERIENCE", "PROFESSIONAL EXPERIENCE — CONTINUED", "PROFESSIONAL EXPERIENCE - CONTINUED", "EMPLOYMENT HISTORY", "WORK EXPERIENCE", "EXPERIENCE", "CORE COMPETENCIES", "KEY BUSINESS COMPETENCIES", "TOP SKILLS", "SKILLS", "LANGUAGES", "EDUCATION", "ACADEMIC BACKGROUND", "CERTIFICATIONS", "CERTIFICATES"] as const;
const competencyPhrases = ["Strategic Business Planning", "Sales & Marketing Management", "Sales &Marketing Management", "Channel Management", "Vendor Management", "Team Building & Development", "Team Building &Development", "Product Management", "Business Development", "Organizational Leadership", "B2B & B2C Marketing"];

function linesOf(text: string) { return text.split(/\r?\n/).map(line => line.replace(/\u0000/g, "").replace(/\s+/g, " ").trim()).filter(Boolean); }
function isHeading(line: string) { return headings.includes(line.toUpperCase() as typeof headings[number]); }
function section(lines: string[], names: string[]) { const start = lines.findIndex(line => names.includes(line.toUpperCase())); if (start < 0) return []; const offset = lines.slice(start + 1).findIndex(isHeading); return lines.slice(start + 1, offset < 0 ? lines.length : start + 1 + offset); }
function clean(value: string) { return value.replace(/^[•●▪◦\uf0b7*-]\s*/, "").replace(/^[“”"]|[“”"]$/g, "").trim(); }
function splitInstitutionLocation(value: string) { const match = value.match(/^(.*?)\s+([\p{Lu}][\p{Ll}][\p{L}.'-]*(?:\s+[\p{Lu}][\p{Ll}][\p{L}.'-]*)*,\s*[\p{Lu}][\p{Ll}][\p{L}.'-]*)$/u); return match ? { institution: match[1].trim(), location: match[2].trim() } : { institution: value.trim(), location: undefined }; }

export function parseStructuredResume(text: string): StructuredResumeSections {
  const lines = linesOf(text);
  const linkedInExport=/(?:^|\n)Contact\s*(?:\n|$)/i.test(text)&&/(?:^|\n)Experience\s*(?:\n|$)/i.test(text)&&/Page \d+ of \d+/i.test(text);
  const experienceIndex = lines.findIndex(line => ["PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY", "WORK EXPERIENCE", "EXPERIENCE"].includes(line.toUpperCase()));
  const header = lines.slice(0, experienceIndex < 0 ? 18 : experienceIndex);
  const summaryIndex=lines.findIndex(line=>line.toUpperCase()==="SUMMARY");
  const linkedInHeaderStart=linkedInExport&&summaryIndex>0?Math.max(0,summaryIndex-12):-1;
  const linkedInHeader=linkedInHeaderStart>=0?lines.slice(linkedInHeaderStart,summaryIndex):[];
  const linkedInHeadlineIndex=linkedInHeader.findIndex(line=>/\b(?:chief|director|president|manager|executive|officer|leader|consultant|advisor|adviser)\b/i.test(line));
  const linkedInName=linkedInHeadlineIndex>0?linkedInHeader[linkedInHeadlineIndex-1]:undefined;
  const name = linkedInName??header.find(line => !isHeading(line) && /^[\p{Lu}][\p{Lu} .'-]{2,80}$/u.test(line) && !/COMPETENC|LANGUAGE|EDUCATION|EXPERIENCE/.test(line));
  const explicitProfile = section(lines, ["EXECUTIVE PROFILE", "PROFESSIONAL SUMMARY", "SUMMARY"]);
  const narrative = explicitProfile.length ? explicitProfile : header.filter(line => line !== name && !isHeading(line) && line.length >= 100 && !/@|\+\d|linkedin\.com/i.test(line));
  const linkedInIdentity=linkedInHeadlineIndex>=0?linkedInHeader.slice(linkedInHeadlineIndex).join(" "):"";
  const linkedInCitizenship=linkedInIdentity.match(/(?:^|\|)\s*((?:EU|European Union|[\p{Lu}][\p{L}-]+)(?:\s*(?:&|and|,)\s*(?:EU|European Union|[\p{Lu}][\p{L}-]+))*)\s+Citizen\b/iu);
  const headline = linkedInHeadlineIndex>=0?linkedInIdentity.slice(0,linkedInCitizenship?.index??linkedInIdentity.length).replace(/[|\s]+$/g,"").trim():header.find(line => line !== name && !isHeading(line) && line.length < 100 && !/\bEXECUTIVE CV\b/i.test(line) && /\b(?:chief|director|president|manager|executive|officer|leader|consultant|advisor|adviser)\b/i.test(line));
  const contact = header.filter(line => /(?:[\w.+-]+@[\w.-]+|\+\d[\d ()-]{6,})/.test(line)).join(" · ") || undefined;
  const citizenshipLine = lines.find(line => /^(?:citizenship|nationality|work authorization)\b/i.test(line) || /\bcitizen(?:ship)?\b/i.test(line));
  const citizenship = linkedInCitizenship?`${linkedInCitizenship[1]} Citizen`:citizenshipLine?.split("|").map(value=>value.trim()).find(value=>/\bcitizen(?:ship)?\b/i.test(value))?.replace(/^(?:citizenship|nationality|work authorization)\s*[:|-]?\s*/i, "");
  const linkedinLine=lines.find(line => /linkedin\.com\//i.test(line));
  const profile = { fullName: name, headline, summary: narrative.map(clean).join(" ") || undefined, citizenship, contact, linkedin: linkedinLine?.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i)?.[0], confidence: (name ? "High" : "Unknown") as Confidence };

  const highlights = section(lines, ["CAREER HIGHLIGHTS", "SELECTED LEADERSHIP VALUE"]).map(clean);
  const skillLines = section(lines, ["CORE COMPETENCIES", "KEY BUSINESS COMPETENCIES", "TOP SKILLS", "SKILLS"]);
  const skillEvidence = skillLines.join(" ");
  const explicitSkills = skillLines.flatMap(line=>line.split(/\s*[•|]\s*/)).map(clean).filter(value=>value.length>1&&value.length<100);
  const skills = [...new Set((skillLines.length>1||/[•|]/.test(skillEvidence)) ? explicitSkills : competencyPhrases.filter(phrase => new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s*&\s*/g, "\\s*&\\s*"), "i").test(`${skillEvidence} ${text}`)))].map(name => ({ name: name.replace("&Marketing", "& Marketing").replace("&Development", "& Development"), category: "Core competency", evidence: name, confidence: "High" as Confidence }));

  const languages = section(lines, ["LANGUAGES"]).flatMap(line => line.split(/\s*[|•]\s*/)).map(line => { const parenthetical=clean(line).match(/^(.+?)\s*\(([^)]+)\)$/); const [language, ...rest] = parenthetical?[parenthetical[1],parenthetical[2]]:clean(line).split(/\s+[—–-]\s+/); const proficiency = rest.join(" — ").trim(); return { language: language.trim(), proficiency: proficiency || undefined, native: /native/i.test(proficiency), evidence: line, confidence: "High" as Confidence }; }).filter(item => item.language);

  const educationLines = section(lines, ["EDUCATION", "ACADEMIC BACKGROUND"]);
  const education: StructuredResumeSections["education"] = [];
  for (let index = 0; index < educationLines.length; index++) {
    const current = educationLines[index];
    const inlineParts=current.split(/\s*\|\s*/).map(clean).filter(Boolean);
    const inlineYears=inlineParts.at(-1)?.match(/\b(\d{4})\s*[-–/]\s*(\d{4})\b/);
    if(inlineParts.length>=3&&inlineYears){
      const qualification=inlineParts.slice(1,-1).join(" | ");
      const minor=qualification.match(/\bminor\s+in\s+(.+)$/i)?.[1]?.trim();
      const fieldOfStudy=qualification.replace(/,?\s*minor\s+in\s+.+$/i,"").replace(/^B\.?Sc\.?\s*/i,"").trim()||undefined;
      education.push({institution:inlineParts[0],qualification,fieldOfStudy,minor,startYear:inlineYears[1],endYear:inlineYears[2],evidence:current,confidence:"High"});
      continue;
    }
    if (/\b\d{4}\s*[-–/]\s*\d{4}\b/.test(current) || /^minor\b/i.test(current)) continue;
    const detail = educationLines[index + 1];
    if (!detail) continue;
    const years = detail.match(/\b(\d{4})\s*[-–/]\s*(\d{4})\b/);
    if (!years) continue;
    const { institution, location } = splitInstitutionLocation(current);
    const qualification = detail.replace(years[0], "").replace(/[·\s]*\(\s*\)\s*$/,"").replace(/[·\s]+$/,"").trim() || undefined;
    education.push({ institution, qualification, fieldOfStudy: qualification, startYear: years[1], endYear: years[2], description: location, evidence: `${current} · ${detail}`, confidence: "High" });
    index++;
  }

  const certificationLines=linkedInExport&&name?(()=>{const start=lines.findIndex(line=>line.toUpperCase()==="CERTIFICATIONS");const stop=lines.findIndex((line,index)=>index>start&&line===name);return start>=0?lines.slice(start+1,stop>start?stop:summaryIndex):[];})():section(lines, ["CERTIFICATIONS", "CERTIFICATES"]);
  const certifications = certificationLines.map(line => { const value = clean(line); const year = value.match(/\b(19|20)\d{2}\b/)?.[0]; return { name: year ? value.replace(year, "").replace(/[|,· -]+$/, "").trim() : value, year, evidence: line, confidence: "High" as Confidence }; }).filter(item => item.name);
  return { profile, highlights, education, languages, skills, certifications };
}
