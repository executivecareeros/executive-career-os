export interface HistoryDocumentDraft {
  id: string;
  organizationName: string;
  roleTitle: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  confidence: "High" | "Medium" | "Low";
  evidence: string;
}

const months: Readonly<Record<string,string>> = {jan:"01",january:"01",feb:"02",february:"02",mar:"03",march:"03",apr:"04",april:"04",may:"05",jun:"06",june:"06",jul:"07",july:"07",aug:"08",august:"08",sep:"09",sept:"09",september:"09",oct:"10",october:"10",nov:"11",november:"11",dec:"12",december:"12"};
const executiveTitle = /\b(chief|ceo|cfo|coo|cto|cmo|cso|president|vice president|vp|director|head|partner|officer|general manager|managing|executive|consultant)\b/i;
const dateRange = /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}(?:-\d{2})?)\s*(?:-|–|—|to)\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}(?:-\d{2})?|present|current)/i;

function normalizeDate(value:string){const trimmed=value.trim();if(/^\d{4}-\d{2}$/.test(trimmed))return trimmed;if(/^\d{4}$/.test(trimmed))return `${trimmed}-01`;const match=trimmed.toLowerCase().match(/^([a-z]+)\s+(\d{4})$/);return match&&months[match[1]]?`${match[2]}-${months[match[1]]}`:undefined;}
function cleanLine(line:string){return line.replace(/^[•●▪◦*-]\s*/,"").replace(/\s+/g," ").trim();}

export function detectHistoryDrafts(input:string):HistoryDocumentDraft[]{
  const lines=input.split(/\r?\n/).map(cleanLine).filter(Boolean).slice(0,2_000),drafts:HistoryDocumentDraft[]=[];
  for(let index=0;index<lines.length;index++){
    const line=lines[index],pipe=line.split("|").map(item=>item.trim()),range=line.match(dateRange);
    if(pipe.length>=3){const pipeRange=`${pipe[2]??""} - ${pipe[3]??"Present"}`.match(dateRange);if(pipe[0]&&pipe[1]&&pipeRange)drafts.push({id:crypto.randomUUID(),organizationName:pipe[0],roleTitle:pipe[1],startDate:normalizeDate(pipeRange[1]),endDate:/present|current/i.test(pipeRange[2])?undefined:normalizeDate(pipeRange[2]),isCurrent:/present|current/i.test(pipeRange[2]),confidence:"High",evidence:line});continue;}
    if(!range)continue;
    const nearby=lines.slice(Math.max(0,index-4),index).filter(candidate=>!dateRange.test(candidate)&&candidate.length<140);
    const role=[...nearby].reverse().find(candidate=>executiveTitle.test(candidate));
    const organization=[...nearby].reverse().find(candidate=>candidate!==role&&!/^(experience|employment|career|professional history)$/i.test(candidate));
    if(!role||!organization)continue;
    drafts.push({id:crypto.randomUUID(),organizationName:organization,roleTitle:role,startDate:normalizeDate(range[1]),endDate:/present|current/i.test(range[2])?undefined:normalizeDate(range[2]),isCurrent:/present|current/i.test(range[2]),confidence:nearby.length>=2?"Medium":"Low",evidence:[...nearby,line].join(" · ")});
  }
  const seen=new Set<string>();return drafts.filter(draft=>{const key=`${draft.organizationName}|${draft.roleTitle}|${draft.startDate??""}`.toLowerCase();if(seen.has(key))return false;seen.add(key);return true;}).slice(0,20);
}
