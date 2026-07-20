import { validateImportFile, sanitizeFilename } from "../lib/import/file-policy.ts";
import { extractHistory } from "../lib/import/extraction.ts";
import { detectHistoryConflicts } from "../lib/import/conflicts.ts";
import { createFirstExecutiveBrief } from "../lib/import/brief.ts";
import { detectHistoryDrafts } from "../lib/import/history-drafts.ts";
import { parseStructuredResume } from "../lib/import/structured-resume.ts";
import { existsSync, readFileSync } from "node:fs";

const provenance={source:"CSV",filename:"fictional.csv",importedAt:"2026-01-01T00:00:00Z",importVersion:"1.0",evidence:[]};
const result=extractHistory("CSV","company,title,start,end\nExample Group,Chief Test Officer,2020-01,2023-01\nExample Group,Chief Test Officer,2020-01,2023-01",provenance);
if(result.experiences.length!==2)throw Error("CSV extraction failed");
if(!detectHistoryConflicts(result.experiences).some(c=>c.type==="Duplicate role"))throw Error("Duplicate conflict missing");
if(validateImportFile({name:"payload.exe",size:10}).ok)throw Error("Executable accepted");
if(validateImportFile({name:"large.csv",size:6*1024*1024}).ok)throw Error("Oversized file accepted");
if(sanitizeFilename("../../sensitive?.csv").includes(".."))throw Error("Filename not sanitized");
const bad=extractHistory("Structured JSON","{bad",provenance);
if(!bad.warnings.length)throw Error("Parser failure not safe");
result.experiences[1].decision="Reject";
const brief=createFirstExecutiveBrief(result.experiences,[]);
if(!brief.facts[0].startsWith("1 confirmed"))throw Error("Review rejection ignored");
const resumeDrafts=detectHistoryDrafts("Chief Strategy Officer\nAurora Meridian Group\nMarch 2022 - Present");
if(resumeDrafts.length!==1||resumeDrafts[0].roleTitle!=="Chief Strategy Officer"||resumeDrafts[0].organizationName!=="Aurora Meridian Group"||resumeDrafts[0].startDate!=="2022-03"||!resumeDrafts[0].isCurrent)throw Error("Resume history extraction failed");
const multiLayout=`KEY BUSINESS COMPETENCIES
JANE EXAMPLE
Strategic Business Planning Business Development Organizational Leadership
PROFESSIONAL EXPERIENCE
Northstar Enterprise Company London, United Kingdom
Public Cloud Sales Manager July 2025
• Led enterprise cloud adoption.
Signal Systems Inc. Paris, France
Sales Director Dec 2023 / Apr 2025
• Signal Systems is a technology company serving enterprise clients.
• Managed strategic accounts.
• Increased revenue by 25%.
Global Mobile Inc. Berlin, Germany
Senior Trade Marketing Executive July 2009 / Jun 2011
• Led channel programs.
Regional Manager Jan 2008 / July 2009
• Managed a team of four.
Key Account Manager Mar 2007 / Jan 2008
• Developed major accounts.
EDUCATION
Example University Amsterdam, Netherlands
International Business 2001-2005`;
const multiDrafts=detectHistoryDrafts(multiLayout);
if(multiDrafts.length!==5)throw Error(`Multi-layout CV expected 5 roles, found ${multiDrafts.length}`);
if(multiDrafts[0].organizationName!=="Northstar Enterprise Company"||multiDrafts[0].location!=="London, United Kingdom"||!multiDrafts[0].isCurrent)throw Error("Current role/company/location extraction failed");
if(multiDrafts.filter(item=>item.organizationName==="Global Mobile Inc.").length!==3)throw Error("Promotion history extraction failed");
if(multiDrafts.some(item=>/COMPETENC|EDUCATION/i.test(`${item.roleDescription??""} ${(item.responsibilities??[]).join(" ")}`)))throw Error("Non-role sections leaked into employment history");
if(multiDrafts[0].roleDescription!==undefined)throw Error("Unknown role description was guessed");
const multiStructured=parseStructuredResume(multiLayout);
if(multiStructured.profile.fullName!=="JANE EXAMPLE"||multiStructured.education.length!==1||multiStructured.skills.length<2)throw Error("Structured CV sections were not extracted safely");
const executiveInlineLayout=`CUNEYT SEN
FOUNDER | AI & INTERNATIONAL GROWTH EXECUTIVE
Istanbul, Türkiye | executive@example.invalid | linkedin.com/in/example | EU & Turkish citizen
EXECUTIVE PROFILE
Founder and international commercial executive with evidence-backed experience.
SELECTED LEADERSHIP VALUE
• Built international channels.
PROFESSIONAL EXPERIENCE
ORENDALIS | Founder | Jan 2026 - Present
Enterprise AI company building intelligent business platforms.
• Founded and lead the company.
ZERO DENSITY | Director of Sales & Business Development | Dec 2020 - Sep 2025
Global provider of virtual production solutions.
• Led EMEA business development.
TÜRK TELEKOM | Regional Sales Manager | Jul 2008 - Sep 2010
Türkiye's leading telecommunications operator.
• Managed international wholesale services.
CORE COMPETENCIES
Artificial Intelligence (AI) • Enterprise Sales • Strategic Partnerships • P&L Management
LANGUAGES
Turkish — Native | English — Fluent / Bilingual Professional | Bulgarian — Limited Working
EDUCATION
OLD DOMINION UNIVERSITY | B.Sc. International Business, Minor in Marketing | 2001-2006`;
const inlineDrafts=detectHistoryDrafts(executiveInlineLayout);
if(inlineDrafts.length!==3)throw Error(`Inline executive CV expected 3 roles, found ${inlineDrafts.length}`);
if(inlineDrafts[0].organizationName!=="ORENDALIS"||inlineDrafts[0].roleTitle!=="Founder"||inlineDrafts[0].companyDescription!=="Enterprise AI company building intelligent business platforms."||inlineDrafts[0].responsibilities?.[0]!=="Founded and lead the company.")throw Error("Inline company, role, description, or responsibility extraction failed");
if(inlineDrafts.some(item=>item.roleDescription!==undefined))throw Error("Unknown inline role descriptions must remain blank");
const inlineStructured=parseStructuredResume(executiveInlineLayout);
if(inlineStructured.profile.citizenship!=="EU & Turkish citizen"||inlineStructured.languages.length!==3||inlineStructured.education.length!==1||inlineStructured.skills.length!==4||inlineStructured.highlights.length!==1)throw Error("Inline executive profile sections were not extracted completely");
const linkedInPdfLayout=`Contact
executive@example.invalid
www.linkedin.com/in/example
Top Skills
Enterprise Sales
Strategic Partnerships
Languages
Turkish (Native or Bilingual)
English (Full Professional)
Certifications
Sales Leadership
JANE EXAMPLE
International Business Development Executive | EMEA Growth | EU & Turkish Citizen
Netherlands
Summary
International commercial executive with evidence-backed experience.
Experience
Example Studio
International Business Development Consultant
June 2026 - Present (2 months)
Istanbul, Türkiye
AI-native creative production studio supporting global brands.
Spearheading international expansion.
ORENDALIS
Founder
January 2026 - Present (7 months)
Istanbul, Türkiye
• Built the executive platform.
Example Technology
Director of Sales And Business Development
December 2020 - September 2025 (4 years 10 months)
İzmir, Turkey
Example Technology is an international technology company.
Türk Telekom
2 years 3 months
Regional Sales Manager
July 2008 - September 2010 (2 years 3 months)
Responsible for international data sales.
Expert
July 2008 - July 2009 (1 year 1 month)
Education
Example University
BS, International Business · (2001 - 2006)
Page 5 of 5`;
const linkedInDrafts=detectHistoryDrafts(linkedInPdfLayout);
if(linkedInDrafts.length!==5)throw Error(`LinkedIn profile PDF expected 5 roles, found ${linkedInDrafts.length}`);
if(linkedInDrafts[0].organizationName!=="Example Studio"||linkedInDrafts[0].location!=="Istanbul, Türkiye"||linkedInDrafts[0].companyDescription!==undefined)throw Error("LinkedIn profile role, location, or unknown company description was mapped incorrectly");
if(linkedInDrafts[1].organizationName!=="ORENDALIS"||linkedInDrafts[1].responsibilities?.[0]!=="Built the executive platform.")throw Error("LinkedIn profile bullet responsibility was not preserved");
if(linkedInDrafts[2].companyDescription!=="Example Technology is an international technology company.")throw Error("Explicit LinkedIn company description was not preserved");
if(linkedInDrafts.filter(item=>item.organizationName==="Türk Telekom").length!==2)throw Error("LinkedIn promotion history did not retain the employer");
if(linkedInDrafts.some(item=>/Page \d+ of \d+|EDUCATION|LANGUAGES/i.test(item.evidence)))throw Error("LinkedIn page or section metadata leaked into experience");
const linkedInStructured=parseStructuredResume(linkedInPdfLayout);
if(linkedInStructured.profile.fullName!=="JANE EXAMPLE"||linkedInStructured.profile.citizenship!=="EU & Turkish Citizen"||linkedInStructured.languages.length!==2||linkedInStructured.skills.length!==2||linkedInStructured.certifications.length!==1)throw Error("LinkedIn profile PDF sections were not mapped correctly");
if(linkedInStructured.education[0]?.qualification!=="BS, International Business")throw Error("LinkedIn education punctuation was not normalized");
const workspace=readFileSync(new URL("../components/import/import-workspace.tsx",import.meta.url),"utf8");
for(const required of ['accept=".pdf,.docx,.txt,.md,.csv,.json"','/api/import/extract','raw file is not retained','Ham dosya saklanmaz','Save my experience and see jobs'])if(!workspace.includes(required))throw Error(`Secure CV flow is missing: ${required}`);
for(const forbidden of ['demoRecords','Career Passport','preview-only','Architecture placeholder'])if(workspace.includes(forbidden))throw Error(`Legacy import language remains: ${forbidden}`);
const actions=readFileSync(new URL("../app/import/actions.ts",import.meta.url),"utf8");
if(!actions.includes('sourceType: "Document Import"')||!actions.includes("keys.has(key)"))throw Error("Confirmed CV history is not provenance-aware and replay-safe");
const documentExtraction=readFileSync(new URL("../lib/import/document-extraction.ts",import.meta.url),"utf8");
if(!documentExtraction.includes('mergePages:false')||!documentExtraction.includes('extracted.join("\\n")'))throw Error("PDF page structure is not preserved for role extraction");
if(existsSync(new URL("../../../CuneytSenCV.pdf",import.meta.url))){
  const { extractText }=await import("unpdf");
  const cvText=await extractText(new Uint8Array(readFileSync(new URL("../../../CuneytSenCV.pdf",import.meta.url))),{mergePages:false});
  const cv=detectHistoryDrafts(Array.isArray(cvText.text)?cvText.text.join("\n"):cvText.text);
  if(cv.length<8)throw Error(`Founder CV extraction found only ${cv.length} roles`);
  for(const employer of ["PRISM AI","Vitpepper Studios","Zero Density","Calpeia","PROFEN Group","Canovate Group","Interoute Turkey","Türk Telekom"])if(!cv.some(draft=>draft.organizationName===employer))throw Error(`Founder CV employer missing: ${employer}`);
  const finalRole=cv.find(draft=>draft.organizationName==="Türk Telekom");
  if(!finalRole)throw Error("Final CV role missing");
  if(/CORE COMPETENCIES|LANGUAGES|EDUCATION/i.test(`${finalRole.roleDescription??""} ${finalRole.companyDescription??""}`))throw Error("Section content leaked into final role");
}
console.log("PASS Import validation — deterministic CV draft extraction, CSV extraction, safe rejection, conflicts, review decisions, sanitization, and deterministic brief");
