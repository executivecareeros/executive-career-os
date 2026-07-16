import { validateImportFile, sanitizeFilename } from "../lib/import/file-policy.ts";
import { extractHistory } from "../lib/import/extraction.ts";
import { detectHistoryConflicts } from "../lib/import/conflicts.ts";
import { createFirstExecutiveBrief } from "../lib/import/brief.ts";
import { detectHistoryDrafts } from "../lib/import/history-drafts.ts";
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
