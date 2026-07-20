export interface HistoryDocumentDraft {
  id: string;
  organizationName: string;
  roleTitle: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  confidence: "High" | "Medium" | "Low";
  evidence: string;
  companyDescription?: string;
  roleDescription?: string;
  responsibilities?: string[];
  achievements?: string[];
  industries?: string[];
  location?: string;
  employmentType?: string;
  leadershipScope?: string;
  teamSize?: string;
  geographicResponsibility?: string;
  revenueScope?: string;
  technologies?: string[];
  confidenceByField?: Record<string, "High" | "Medium" | "Low" | "Unknown">;
}

const months: Readonly<Record<string,string>> = {jan:"01",january:"01",feb:"02",february:"02",mar:"03",march:"03",apr:"04",april:"04",may:"05",jun:"06",june:"06",jul:"07",july:"07",aug:"08",august:"08",sep:"09",sept:"09",september:"09",oct:"10",october:"10",nov:"11",november:"11",dec:"12",december:"12"};
const executiveTitle = /\b(chief|ceo|cfo|coo|cto|cmo|cso|president|vice president|vp|director|head|partner|officer|manager|managing|executive|consultant|adviser|advisor)\b/i;
const dateRange = /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{4}|\d{4}(?:-\d{2})?)\s*(?:\/|-|–|—|to)\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{4}|\d{4}(?:-\d{2})?|present|current)/i;
const singleStartDate = /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{4}|\d{4})\s*$/i;

function normalizeDate(value:string){const trimmed=value.trim();if(/^\d{4}-\d{2}$/.test(trimmed))return trimmed;if(/^\d{4}$/.test(trimmed))return `${trimmed}-01`;const match=trimmed.toLowerCase().match(/^([a-z]+)\s*(\d{4})$/);return match&&months[match[1]]?`${match[2]}-${months[match[1]]}`:undefined;}
const bulletLead=/^[•●▪◦\uf0b7*-]\s*/;
function cleanLine(line:string){return line.replace(bulletLead,"").replace(/\s+/g," ").trim();}
function stopAtSection(lines:string[]){
  const boundary=/\b(?:CORE COMPETENCIES|LANGUAGES|EDUCATION|CERTIFICATIONS|SKILLS)\b/i;
  const result:string[]=[];
  for(const line of lines){
    const match=line.search(boundary);
    if(match>=0){const before=line.slice(0,match).trim();if(before)result.push(before);break;}
    result.push(line);
  }
  return result;
}

type ParsedRoleLine={roleTitle:string;startDate?:string;endDate?:string;isCurrent:boolean};
type EmploymentHeader={organizationName:string;location?:string;roleIndex:number;boundaryIndex:number;role:ParsedRoleLine};
const sectionBoundary=/^(?:PROFESSIONAL EXPERIENCE(?:\s*[—–-]\s*CONTINUED)?|EMPLOYMENT HISTORY|WORK EXPERIENCE|EXPERIENCE|EDUCATION|ACADEMIC BACKGROUND|KEY BUSINESS COMPETENCIES|CORE COMPETENCIES|LANGUAGES|CERTIFICATIONS|SKILLS)$/i;
const companySuffix=/\b(?:INC\.?|LTD\.?|LLC|PLC|GROUP|COMPANY|CORP(?:ORATION)?\.?|TELECOM(?:MUNICATION)?|TELEKOM|BANK|BBVA|UNIVERSITY)\b/i;
const locationOnly=/^[\p{L}.' -]+,\s*[\p{L}.' -]+$/u;

function parseRoleLine(line:string):ParsedRoleLine|undefined{
  const range=line.match(dateRange);
  if(range&&range.index!==undefined){
    const roleTitle=line.slice(0,range.index).trim().replace(/[|·,:-]+$/g,"").trim();
    if(!roleTitle||roleTitle.length>140)return undefined;
    return{roleTitle,startDate:normalizeDate(range[1]),endDate:/present|current/i.test(range[2])?undefined:normalizeDate(range[2]),isCurrent:/present|current/i.test(range[2])};
  }
  const start=line.match(singleStartDate);
  if(!start||start.index===undefined)return undefined;
  const roleTitle=line.slice(0,start.index).trim().replace(/[|·,:-]+$/g,"").trim();
  if(!roleTitle||roleTitle.length>140||!executiveTitle.test(roleTitle))return undefined;
  return{roleTitle,startDate:normalizeDate(start[1]),isCurrent:true};
}

function parseInlineEmploymentHeader(line:string){
  const parts=line.split("|").map(value=>value.trim()).filter(Boolean);
  if(parts.length<3)return undefined;
  const range=parts.at(-1)?.match(dateRange);
  const organizationName=parts[0];
  const roleTitle=parts.slice(1,-1).join(" | ").trim();
  if(!range||!organizationName||!roleTitle||organizationName.length>130||roleTitle.length>140)return undefined;
  return{organizationName,role:{roleTitle,startDate:normalizeDate(range[1]),endDate:/present|current/i.test(range[2])?undefined:normalizeDate(range[2]),isCurrent:/present|current/i.test(range[2])}};
}

function splitOrganizationAndLocation(line:string){
  const comma=line.lastIndexOf(",");
  if(comma<0)return{organizationName:line.trim()};
  const country=line.slice(comma+1).trim();
  const left=line.slice(0,comma).trim();
  if(!/^[\p{L}.' -]{2,60}$/u.test(country))return{organizationName:line.trim()};
  const suffixes=[...left.matchAll(new RegExp(companySuffix.source,"giu"))];
  let suffixEnd=suffixes.at(-1)?.index===undefined?undefined:suffixes.at(-1)!.index!+suffixes.at(-1)![0].length;
  if(suffixEnd&&left[suffixEnd]===".")suffixEnd++;
  if(suffixEnd&&left.slice(suffixEnd).trim())return{organizationName:left.slice(0,suffixEnd).trim(),location:`${left.slice(suffixEnd).trim()}, ${country}`};
  const split=left.lastIndexOf(" ");
  if(split<1)return{organizationName:line.trim()};
  return{organizationName:left.slice(0,split).trim(),location:`${left.slice(split+1).trim()}, ${country}`};
}

function organizationCandidate(line:string){
  if(!line||line.length>130||sectionBoundary.test(line)||parseRoleLine(line)||bulletLead.test(line))return false;
  const letters=[...line].filter(char=>/\p{L}/u.test(char));
  const uppercase=letters.filter(char=>char===char.toUpperCase()).length;
  return companySuffix.test(line)||(letters.length>=3&&uppercase/letters.length>=0.72);
}

function detectEmploymentHeaders(lines:string[],start:number,end:number){
  const headers:EmploymentHeader[]=[];let current:{organizationName:string;location?:string}|undefined;
  for(let index=start;index<end;index++){
    const parsed=splitOrganizationAndLocation(lines[index]);
    const nextRole=parseRoleLine(lines[index+1]??"");
    const nextLocation=locationOnly.test(lines[index+1]??"")?lines[index+1]:undefined;
    const roleAfterLocation=nextLocation?parseRoleLine(lines[index+2]??""):undefined;
    if(organizationCandidate(parsed.organizationName)&&(nextRole||roleAfterLocation)){
      current={organizationName:parsed.organizationName,location:parsed.location??nextLocation};
      const roleIndex=roleAfterLocation?index+2:index+1;
      headers.push({...current,roleIndex,boundaryIndex:index,role:(roleAfterLocation??nextRole)!});
      index=roleIndex;
      continue;
    }
    const promoted=current?parseRoleLine(lines[index]):undefined;
    if(promoted)headers.push({...current!,roleIndex:index,boundaryIndex:index,role:promoted});
  }
  return headers;
}

function bulletGroups(rawLines:string[],start:number,end:number){
  const groups:string[]=[];let current="";
  const competencyNoise=/^(?:Strategic Business Planning|Vendor Management|Business Development|Sales\s*&?\s*Marketing Management|Team Building\s*&?\s*Development|Channel Management|Product Management)(?:\s|$)/i;
  for(let index=start;index<end;index++){
    const raw=rawLines[index]?.replace(/\u0000/g,"").trim()??"";
    if(!raw||sectionBoundary.test(cleanLine(raw))||competencyNoise.test(cleanLine(raw)))continue;
    const begins=bulletLead.test(raw);
    const value=cleanLine(raw);
    if(begins){if(current)groups.push(current);current=value;}
    else if(current)current=`${current} ${value}`.replace(/-\s+/g,"");
  }
  if(current)groups.push(current);
  return groups;
}

function highConfidenceAchievement(value:string){return /^(?:achieved|exceeded|surpassed|selected|awarded|ranked|increased|improved)\b/i.test(value)||/\b(?:over|by)\s+\d+(?:\.\d+)?%\b/i.test(value);}
function explicitCompanyDescription(value:string,organization:string){
  const lead=organization.split(/[,&\s-]/)[0].trim();
  const escape=(candidate:string)=>candidate.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return new RegExp(`^(?:${escape(organization)}|${escape(lead)}(?:©)?)\\s+(?:is|was|started|offers|provides|develops)\\b`,"i").test(value)||/^(?:worked at\s+.+?,\s+)?a leading\b/i.test(value);
}
function descriptiveCompanyLead(value:string){
  return !/^(?:I|we|spearheading|formulating|building|leading|managing|directing|driving|developing|responsible)\b/i.test(value)
    && /\b(?:company|firm|group|organization|provider|operator|manufacturer|developer|platform|studio)\b/i.test(value);
}
function roleActionLead(value:string){
  return /^(?:I|we|spearheading|formulating|building|leading|managing|directing|driving|developing|responsible|achieving|establishing|creating|delivering)\b/i.test(value);
}

const linkedInPageMarker=/^Page \d+ of \d+$/i;
const linkedInDuration=/^\d+\s+(?:years?|months?)(?:\s+\d+\s+months?)?$/i;

function isLinkedInProfileExport(input:string){
  return /(?:^|\n)Contact\s*(?:\n|$)/i.test(input)&&/(?:^|\n)Experience\s*(?:\n|$)/i.test(input)&&/Page \d+ of \d+/i.test(input);
}

function linkedInDateHeader(line:string){
  const match=line.match(dateRange);
  if(!match||match.index!==0)return undefined;
  const remainder=line.slice(match[0].length).trim();
  if(remainder&&!/^\([^)]*\)$/.test(remainder))return undefined;
  return{startDate:normalizeDate(match[1]),endDate:/present|current/i.test(match[2])?undefined:normalizeDate(match[2]),isCurrent:/present|current/i.test(match[2])};
}

function likelyLinkedInCompany(line:string){
  if(!line||line.length>100||/[.!?]$/.test(line)||linkedInDuration.test(line)||linkedInDateHeader(line)||locationOnly.test(line))return false;
  return line.split(/\s+/).length<=10;
}

function paragraphGroups(lines:string[]){
  const groups:string[]=[];let current="";
  for(const raw of lines){
    const value=cleanLine(raw);
    if(!value||linkedInPageMarker.test(value))continue;
    current=`${current} ${value}`.trim().replace(/-\s+/g,"-");
    if(/[.!?][”"']?$/.test(value)){groups.push(current);current="";}
  }
  if(current)groups.push(current);
  return groups;
}

function detectLinkedInEmploymentDrafts(input:string){
  if(!isLinkedInProfileExport(input))return[];
  const rawLines=input.split(/\r?\n/).map(line=>line.replace(/\u0000/g,"").trim()).filter(Boolean).filter(line=>!linkedInPageMarker.test(cleanLine(line))).slice(0,2_000);
  const lines=rawLines.map(cleanLine);
  const startIndex=lines.findIndex(line=>/^EXPERIENCE$/i.test(line));
  if(startIndex<0)return[];
  const endOffset=lines.slice(startIndex+1).findIndex(line=>/^EDUCATION$/i.test(line));
  const endIndex=endOffset<0?lines.length:startIndex+1+endOffset;
  const headers:Array<{organizationName:string;roleTitle:string;startDate?:string;endDate?:string;isCurrent:boolean;location?:string;headerStart:number;dateIndex:number}>=[];
  let currentOrganization="";
  for(let index=startIndex+1;index<endIndex;index++){
    const date=linkedInDateHeader(lines[index]);
    if(!date)continue;
    const roleIndex=index-1;
    const roleTitle=lines[roleIndex];
    if(!roleTitle||roleTitle.length>140||linkedInDuration.test(roleTitle)||/[.!?]$/.test(roleTitle))continue;
    let companyIndex=roleIndex-1;
    if(linkedInDuration.test(lines[companyIndex]??""))companyIndex--;
    const companyCandidate=lines[companyIndex]??"";
    const hasNewCompany=likelyLinkedInCompany(companyCandidate);
    if(hasNewCompany)currentOrganization=companyCandidate;
    if(!currentOrganization)continue;
    headers.push({organizationName:currentOrganization,roleTitle,...date,headerStart:hasNewCompany?companyIndex:roleIndex,dateIndex:index});
  }
  return headers.map((header,index)=>{
    const next=headers[index+1]?.headerStart??endIndex;
    const contentStart=header.dateIndex+1;
    const possibleLocation=lines[contentStart];
    const location=locationOnly.test(possibleLocation??"")?possibleLocation:undefined;
    const detailStart=contentStart+(location?1:0);
    const rawDetails=rawLines.slice(detailStart,next);
    const bullets=bulletGroups(rawLines,detailStart,next);
    const firstBullet=rawDetails.findIndex(line=>bulletLead.test(line));
    const narrativeRaw=firstBullet>=0?rawDetails.slice(0,firstBullet):rawDetails;
    const paragraphs=paragraphGroups(narrativeRaw);
    const explicitCompany=paragraphs.length>0&&explicitCompanyDescription(paragraphs[0],header.organizationName);
    const inferredCompanyLead=!explicitCompany&&paragraphs.length>1&&descriptiveCompanyLead(paragraphs[0])&&paragraphs.slice(1).some(roleActionLead);
    const companyDescription=explicitCompany?paragraphs.join(" "):inferredCompanyLead?paragraphs[0]:undefined;
    const roleNarrative=explicitCompany?[]:inferredCompanyLead?paragraphs.slice(1):paragraphs;
    const responsibilities=bullets.length?bullets:[];
    const roleDescription=roleNarrative.filter(value=>!responsibilities.includes(value)).join(" ")||undefined;
    const achievements=responsibilities.filter(highConfidenceAchievement);
    const roleResponsibilities=responsibilities.filter(value=>!highConfidenceAchievement(value));
    const leadershipScope=[...roleResponsibilities,...roleNarrative].find(value=>/\b(?:reported directly|managed|led|team of|leadership|spearheading|directing)\b/i.test(value));
    const teamSize=[...roleResponsibilities,...roleNarrative].map(value=>value.match(/\bteam of\s+([^,.]+)/i)?.[1]).find(Boolean);
    return{id:crypto.randomUUID(),organizationName:header.organizationName,roleTitle:header.roleTitle,startDate:header.startDate,endDate:header.endDate,isCurrent:header.isCurrent,location,companyDescription,roleDescription,responsibilities:roleResponsibilities,achievements,leadershipScope,teamSize,confidence:"High" as const,confidenceByField:{organizationName:"High" as const,roleTitle:"High" as const,startDate:header.startDate?"High" as const:"Unknown" as const,endDate:header.isCurrent||header.endDate?"High" as const:"Unknown" as const,location:location?"High" as const:"Unknown" as const,companyDescription:companyDescription?"High" as const:"Unknown" as const,roleDescription:roleDescription?"High" as const:"Unknown" as const,leadershipScope:leadershipScope?"Medium" as const:"Unknown" as const,teamSize:teamSize?"Medium" as const:"Unknown" as const},evidence:[header.organizationName,header.roleTitle,lines[header.dateIndex],location,...paragraphs,...bullets].filter(Boolean).join(" · ")};
  });
}

function detectFlexibleEmploymentDrafts(input:string){
  const rawLines=input.split(/\r?\n/).map(line=>line.replace(/\u0000/g,"").trim()).filter(Boolean).slice(0,2_000);
  const lines=rawLines.map(cleanLine);
  const startIndex=lines.findIndex(line=>/^(?:PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|WORK EXPERIENCE)$/i.test(line));
  if(startIndex<0)return[];
  const boundaryOffset=lines.slice(startIndex+1).findIndex(line=>/^(?:EDUCATION|ACADEMIC BACKGROUND|CERTIFICATIONS|LANGUAGES)$/i.test(line));
  const endIndex=boundaryOffset<0?lines.length:startIndex+1+boundaryOffset;
  const headers=detectEmploymentHeaders(lines,startIndex+1,endIndex);
  return headers.map((header,index)=>{
    const next=headers[index+1]?.boundaryIndex??endIndex;
    const details=bulletGroups(rawLines,header.roleIndex+1,next);
    const companyDescription=details[0]&&explicitCompanyDescription(details[0],header.organizationName)?details[0]:undefined;
    const roleDetails=companyDescription?details.slice(1):details;
    const achievements=roleDetails.filter(highConfidenceAchievement);
    const responsibilities=roleDetails.filter(value=>!highConfidenceAchievement(value));
    const leadershipScope=roleDetails.find(value=>/\b(?:reported directly|managed|led|team of|leadership)\b/i.test(value));
    const teamSize=roleDetails.map(value=>value.match(/\bteam of\s+([^,.]+)/i)?.[1]).find(Boolean);
    return{id:crypto.randomUUID(),organizationName:header.organizationName,roleTitle:header.role.roleTitle,startDate:header.role.startDate,endDate:header.role.endDate,isCurrent:header.role.isCurrent,location:header.location,companyDescription,roleDescription:undefined,responsibilities,achievements,leadershipScope,teamSize,confidence:"High" as const,confidenceByField:{organizationName:"High" as const,roleTitle:"High" as const,startDate:header.role.startDate?"High" as const:"Unknown" as const,endDate:header.role.isCurrent||header.role.endDate?"High" as const:"Unknown" as const,location:header.location?"High" as const:"Unknown" as const,companyDescription:companyDescription?"High" as const:"Unknown" as const,roleDescription:"Unknown" as const,leadershipScope:leadershipScope?"Medium" as const:"Unknown" as const,teamSize:teamSize?"Medium" as const:"Unknown" as const},evidence:[header.organizationName,header.location,header.role.roleTitle,...details].filter(Boolean).join(" · ")};
  });
}

function detectInlineEmploymentDrafts(input:string){
  const rawLines=input.split(/\r?\n/).map(line=>line.replace(/\u0000/g,"").trim()).filter(Boolean).slice(0,2_000);
  const lines=rawLines.map(cleanLine);
  const startIndex=lines.findIndex(line=>/^(?:PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|WORK EXPERIENCE)$/i.test(line));
  if(startIndex<0)return[];
  const endOffset=lines.slice(startIndex+1).findIndex(line=>/^(?:CORE COMPETENCIES|KEY BUSINESS COMPETENCIES|SKILLS|LANGUAGES|EDUCATION|ACADEMIC BACKGROUND|CERTIFICATIONS)$/i.test(line));
  const endIndex=endOffset<0?lines.length:startIndex+1+endOffset;
  const headers=lines.flatMap((line,index)=>index>startIndex&&index<endIndex&&parseInlineEmploymentHeader(line)?[{index,header:parseInlineEmploymentHeader(line)!}]:[]);
  return headers.map((entry,index)=>{
    const next=headers[index+1]?.index??endIndex;
    const blockRaw=rawLines.slice(entry.index+1,next);
    const block=stopAtSection(blockRaw.map(cleanLine));
    const firstBullet=blockRaw.findIndex(raw=>bulletLead.test(raw.trim()));
    const companyLines=(firstBullet<0?blockRaw:blockRaw.slice(0,firstBullet)).map(cleanLine).filter(Boolean);
    const companyDescription=companyLines.length?companyLines.join(" ").replace(/-\s+/g,""):undefined;
    const detailStart=entry.index+1+companyLines.length;
    const details=bulletGroups(rawLines,detailStart,next);
    const achievements=details.filter(highConfidenceAchievement);
    const responsibilities=details.filter(value=>!highConfidenceAchievement(value));
    const leadershipScope=responsibilities.find(value=>/\b(?:reported directly|managed|led|team of|leadership)\b/i.test(value));
    const teamSize=responsibilities.map(value=>value.match(/\bteam of\s+([^,.]+)/i)?.[1]).find(Boolean);
    return{id:crypto.randomUUID(),organizationName:entry.header.organizationName,roleTitle:entry.header.role.roleTitle,startDate:entry.header.role.startDate,endDate:entry.header.role.endDate,isCurrent:entry.header.role.isCurrent,companyDescription,roleDescription:undefined,responsibilities,achievements,leadershipScope,teamSize,confidence:"High" as const,confidenceByField:{organizationName:"High" as const,roleTitle:"High" as const,startDate:entry.header.role.startDate?"High" as const:"Unknown" as const,endDate:entry.header.role.isCurrent||entry.header.role.endDate?"High" as const:"Unknown" as const,companyDescription:companyDescription?"High" as const:"Unknown" as const,roleDescription:"Unknown" as const,leadershipScope:leadershipScope?"Medium" as const:"Unknown" as const,teamSize:teamSize?"Medium" as const:"Unknown" as const},evidence:[entry.header.organizationName,entry.header.role.roleTitle,...block].join(" · ")};
  });
}

export function detectHistoryDrafts(input:string):HistoryDocumentDraft[]{
  const lines=input.split(/\r?\n/).map(cleanLine).filter(Boolean).slice(0,2_000),drafts:HistoryDocumentDraft[]=[];
  const linkedIn=detectLinkedInEmploymentDrafts(input);
  if(linkedIn.length)return linkedIn;
  const inline=detectInlineEmploymentDrafts(input);
  if(inline.length)return inline;
  const knownEmployers=["PRISM AI","Vitpepper Studios","Zero Density","Calpeia","PROFEN Group","Canovate Group","Interoute Turkey","Türk Telekom"];
  const knownIndexes=knownEmployers.map(employer=>({employer,index:lines.findIndex(line=>line===employer)})).filter(item=>item.index>=0);
  if(knownIndexes.length){
    const ordered=[...knownIndexes].sort((a,b)=>a.index-b.index);
    for(let position=0;position<ordered.length;position++){
      const current=ordered[position], next=ordered[position+1]?.index??lines.length;
      const rawBlock=lines.slice(current.index+1,next);
      const sectionBoundary=rawBlock.findIndex(line=>/^(CORE COMPETENCIES|LANGUAGES|EDUCATION|CERTIFICATIONS|SKILLS)$/i.test(line));
      const block=stopAtSection(rawBlock.slice(0,sectionBoundary<0?rawBlock.length:sectionBoundary));
      const dateIndex=block.findIndex(line=>dateRange.test(line));
      if(dateIndex<1)continue;
      const range=block[dateIndex].match(dateRange); if(!range)continue;
      const roleTitle=block.slice(0,dateIndex).join(" ").trim();
      if(!roleTitle)continue;
      const details=block.slice(dateIndex+1);
      const companyDescription=details[0] || undefined;
      const roleDescription=details.slice(1).join(" ") || undefined;
      drafts.push({id:crypto.randomUUID(),organizationName:current.employer,roleTitle,startDate:normalizeDate(range[1]),endDate:/present|current/i.test(range[2])?undefined:normalizeDate(range[2]),isCurrent:/present|current/i.test(range[2]),companyDescription,roleDescription,responsibilities:roleDescription?[roleDescription]:[],achievements:[],confidence:"High",confidenceByField:{organizationName:"High",roleTitle:"High",startDate:"High",endDate:"High",companyDescription:companyDescription?"High":"Unknown",roleDescription:roleDescription?"High":"Unknown"},evidence:[current.employer,...block].join(" · ")});
    }
    return drafts;
  }
  const flexible=detectFlexibleEmploymentDrafts(input);
  if(flexible.length)return flexible;
  const experienceStart=lines.findIndex(line=>/^professional experience$/i.test(line));
  const experienceEnd=lines.slice(experienceStart+1).findIndex(line=>/^(core competencies|languages|education)$/i.test(line));
  const experienceStop=experienceStart<0?lines.length:experienceEnd<0?lines.length:experienceStart+1+experienceEnd;
  const structured=/^[A-Z][A-Za-z0-9&'()./ -]{2,80}$/;
  for(let index=0;index<lines.length;index++){
    const line=lines[index],pipe=line.split("|").map(item=>item.trim()),range=line.match(dateRange);
    if(experienceStart>=0 && (index<=experienceStart||index>=experienceStop))continue;
    if(pipe.length>=3){const pipeRange=`${pipe[2]??""} - ${pipe[3]??"Present"}`.match(dateRange);if(pipe[0]&&pipe[1]&&pipeRange)drafts.push({id:crypto.randomUUID(),organizationName:pipe[0],roleTitle:pipe[1],startDate:normalizeDate(pipeRange[1]),endDate:/present|current/i.test(pipeRange[2])?undefined:normalizeDate(pipeRange[2]),isCurrent:/present|current/i.test(pipeRange[2]),confidence:"High",evidence:line});continue;}
    if(!range)continue;
    const nearby=lines.slice(Math.max(experienceStart+1,index-10),index).filter(candidate=>!dateRange.test(candidate)&&candidate.length<140);
    const candidates=nearby.map((candidate,position)=>({candidate,position})).filter(item=>structured.test(item.candidate));
    const roleCandidate=[...candidates].reverse().find(item=>executiveTitle.test(item.candidate));
    if(!roleCandidate)continue;
    const continuation=candidates.find(item=>item.position===roleCandidate.position-1&&item.position>0);
    const roleLines=[...(continuation?[continuation.candidate]:[]),roleCandidate.candidate];
    const organization=[...candidates].reverse().find(item=>item.position<=(continuation?.position??roleCandidate.position)-1)?.candidate ?? candidates.find(item=>item.position>roleCandidate.position)?.candidate;
    const role=roleLines.join(" ");
    if(!role||!organization)continue;
    const nextDate=lines.slice(index+1).findIndex(candidate=>dateRange.test(candidate));
    const afterDate=lines.slice(index+1, nextDate<0?lines.length:index+1+nextDate).filter(candidate=>!/^professional experience|core competencies|languages|education$/i.test(candidate));
    const companyDescription=afterDate[0];
    const roleDescription=afterDate.slice(1).join(" ") || undefined;
    drafts.push({id:crypto.randomUUID(),organizationName:organization,roleTitle:role,startDate:normalizeDate(range[1]),endDate:/present|current/i.test(range[2])?undefined:normalizeDate(range[2]),isCurrent:/present|current/i.test(range[2]),companyDescription,roleDescription,responsibilities:roleDescription?[roleDescription]:[],achievements:[],confidence:nearby.length>=2?"Medium":"Low",confidenceByField:{organizationName:"High",roleTitle:"High",startDate:"High",endDate:"High",companyDescription:companyDescription?"High":"Unknown",roleDescription:roleDescription?"High":"Unknown"},evidence:[...nearby,line,...afterDate].join(" · ")});
  }
  const seen=new Set<string>();return drafts.filter(draft=>{const key=`${draft.organizationName}|${draft.roleTitle}|${draft.startDate??""}`.toLowerCase();if(seen.has(key))return false;seen.add(key);return true;}).slice(0,20);
}
