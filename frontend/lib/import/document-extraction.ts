import "server-only";
import { extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";
import { sanitizeFilename } from "./file-policy";
import { detectHistoryDrafts, type HistoryDocumentDraft } from "./history-drafts";

export const RESUME_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv", ".json"] as const;
export const MAX_RESUME_TEXT = 80_000;

export interface HistoryDocumentExtraction {
  filename: string;
  format: string;
  text: string;
  drafts: HistoryDocumentDraft[];
  warnings: string[];
  profile?: { fullName?: string; headline?: string; summary?: string; citizenship?: string; contact?: string; linkedin?: string; confidence: "High" | "Medium" | "Low" | "Unknown" };
  highlights: string[];
  education: Array<{ institution: string; qualification?: string; fieldOfStudy?: string; minor?: string; startYear?: string; endYear?: string; description?: string; evidence: string; confidence: "High" | "Medium" | "Low" | "Unknown" }>;
  languages: Array<{ language: string; proficiency?: string; native?: boolean; evidence: string; confidence: "High" | "Medium" | "Low" | "Unknown" }>;
  skills: Array<{ name: string; category: string; evidence: string; confidence: "High" | "Medium" | "Low" | "Unknown" }>;
  rawText: string;
}

const sectionNames = ["EXECUTIVE PROFILE", "CAREER HIGHLIGHTS", "PROFESSIONAL EXPERIENCE", "CORE COMPETENCIES", "LANGUAGES", "EDUCATION"] as const;
function sectionLines(text:string, name:string){const lines=text.split(/\r?\n/).map(line=>line.replace(/\u0000/g,"").replace(/\s+/g," ").trim()).filter(Boolean);const start=lines.findIndex(line=>line.toUpperCase()===name);if(start<0)return[];const end=lines.slice(start+1).findIndex(line=>sectionNames.includes(line.toUpperCase() as typeof sectionNames[number]));return lines.slice(start+1,end<0?lines.length:start+1+end);}
function parseStructuredSections(text:string){
  const profileLines=sectionLines(text,"EXECUTIVE PROFILE");
  const header=text.split(/\r?\n/).map(line=>line.replace(/\u0000/g,"").replace(/\s+/g," ").trim()).filter(Boolean).slice(0,12);
  const profile={fullName:header[0],headline:header[1],summary:profileLines.join(" ")||undefined,citizenship:header.find(line=>/^(?:EU\s*&\s*Turkish|citizenship\b)/i.test(line))?.replace(/^citizenship\s*/i,""),contact:header.filter(line=>/^\+|^[\w.+-]+@[\w.-]+$/.test(line)).join(" · ")||undefined,linkedin:header.find(line=>/linkedin\.com\//i.test(line)),confidence:"High" as const};
  const highlights=sectionLines(text,"CAREER HIGHLIGHTS").map(line=>line.replace(/^[•●▪◦*-]\s*/,""));
  const skills=sectionLines(text,"CORE COMPETENCIES").flatMap(line=>line.split("•").map(item=>item.trim()).filter(Boolean).map(name=>({name,category:"Core competency",evidence:name,confidence:"High" as const})));
  const languages=sectionLines(text,"LANGUAGES").map(line=>{const [language,...rest]=line.split("—");const proficiency=rest.join("—").trim();return{language:language.trim(),proficiency:proficiency||undefined,native:/native/i.test(proficiency),evidence:line,confidence:"High" as const};});
  const educationLines=sectionLines(text,"EDUCATION");const education:Array<{institution:string;qualification?:string;fieldOfStudy?:string;minor?:string;startYear?:string;endYear?:string;description?:string;evidence:string;confidence:"High"}> = [];
  for(let i=0;i<educationLines.length;i++){const institution=educationLines[i];if(/^(B\.|M\.|Minor|\d{4}|[A-Z].*\d{4})/i.test(institution))continue;const detail=educationLines[i+1];const years=(detail??"").match(/(\d{4})\s*[–-]\s*(\d{4})/);education.push({institution,qualification:detail&&!/^minor/i.test(detail)?detail.replace(/\s*\(.*/,""):undefined,fieldOfStudy:/international business/i.test(detail??"")?"International Business":undefined,minor:educationLines.slice(i+1,i+3).find(line=>/^minor/i.test(line))?.replace(/^minor in /i,""),startYear:years?.[1],endYear:years?.[2],evidence:[institution,detail].filter(Boolean).join(" · "),confidence:"High"});}
  return {profile,highlights,skills,languages,education};
}

function extension(name:string){const lower=name.toLowerCase();return RESUME_EXTENSIONS.find(item=>lower.endsWith(item));}

export async function extractHistoryDocument(file:File):Promise<HistoryDocumentExtraction>{
  const ext=extension(file.name);if(!ext)throw new Error("Unsupported file type. Use PDF, DOCX, TXT, Markdown, CSV, or JSON.");
  if(file.size===0)throw new Error("The selected file is empty.");
  const bytes=new Uint8Array(await file.arrayBuffer());let text="";
  if(ext===".pdf"){
    if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")throw new Error("The file does not have a valid PDF signature.");
    const extracted=(await extractPdfText(bytes,{mergePages:false})).text;
    text=Array.isArray(extracted)?extracted.join("\n"):extracted;
  }else if(ext===".docx"){
    if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error("The file does not have a valid DOCX container signature.");
    text=(await mammoth.extractRawText({buffer:Buffer.from(bytes)})).value;
  }else{
    if(bytes.slice(0,512).some(byte=>byte===0))throw new Error("The selected text file contains binary content.");
    text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  }
  text=text.replace(/\u0000/g,"").trim().slice(0,MAX_RESUME_TEXT);if(!text)throw new Error("No readable text could be extracted. Scanned PDFs require OCR, which is not enabled in this release.");
  const drafts=detectHistoryDrafts(text),warnings:string[]=[];if(!drafts.length)warnings.push("No role could be mapped with sufficient confidence. Review the extracted text and enter the role manually; no history was created.");
  const structured=parseStructuredSections(text);
  return{filename:sanitizeFilename(file.name),format:ext.slice(1).toUpperCase(),text,rawText:text,drafts,warnings,...structured};
}
