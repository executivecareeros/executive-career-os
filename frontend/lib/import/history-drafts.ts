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
const executiveTitle = /\b(chief|ceo|cfo|coo|cto|cmo|cso|president|vice president|vp|director|head|partner|officer|general manager|managing|executive|consultant)\b/i;
const dateRange = /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}(?:-\d{2})?)\s*(?:-|–|—|to)\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}(?:-\d{2})?|present|current)/i;

function normalizeDate(value:string){const trimmed=value.trim();if(/^\d{4}-\d{2}$/.test(trimmed))return trimmed;if(/^\d{4}$/.test(trimmed))return `${trimmed}-01`;const match=trimmed.toLowerCase().match(/^([a-z]+)\s+(\d{4})$/);return match&&months[match[1]]?`${match[2]}-${months[match[1]]}`:undefined;}
function cleanLine(line:string){return line.replace(/^[•●▪◦*-]\s*/,"").replace(/\s+/g," ").trim();}
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

export function detectHistoryDrafts(input:string):HistoryDocumentDraft[]{
  const lines=input.split(/\r?\n/).map(cleanLine).filter(Boolean).slice(0,2_000),drafts:HistoryDocumentDraft[]=[];
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
