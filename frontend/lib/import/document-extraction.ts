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
}

function extension(name:string){const lower=name.toLowerCase();return RESUME_EXTENSIONS.find(item=>lower.endsWith(item));}

export async function extractHistoryDocument(file:File):Promise<HistoryDocumentExtraction>{
  const ext=extension(file.name);if(!ext)throw new Error("Unsupported file type. Use PDF, DOCX, TXT, Markdown, CSV, or JSON.");
  if(file.size===0)throw new Error("The selected file is empty.");
  const bytes=new Uint8Array(await file.arrayBuffer());let text="";
  if(ext===".pdf"){
    if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")throw new Error("The file does not have a valid PDF signature.");
    text=(await extractPdfText(bytes,{mergePages:true})).text;
  }else if(ext===".docx"){
    if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error("The file does not have a valid DOCX container signature.");
    text=(await mammoth.extractRawText({buffer:Buffer.from(bytes)})).value;
  }else{
    if(bytes.slice(0,512).some(byte=>byte===0))throw new Error("The selected text file contains binary content.");
    text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  }
  text=text.replace(/\u0000/g,"").trim().slice(0,MAX_RESUME_TEXT);if(!text)throw new Error("No readable text could be extracted. Scanned PDFs require OCR, which is not enabled in this release.");
  const drafts=detectHistoryDrafts(text),warnings:string[]=[];if(!drafts.length)warnings.push("No role could be mapped with sufficient confidence. Review the extracted text and enter the role manually; no history was created.");
  return{filename:sanitizeFilename(file.name),format:ext.slice(1).toUpperCase(),text,drafts,warnings};
}
