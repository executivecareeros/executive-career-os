export type CvImportSession = { id:string; source_filename?:string|null; status:string; stage:string; summary?:Record<string,unknown>|null; created_at:string; completed_at?:string|null };
export type ProfileExperienceEvidence = { id:string; confidence?:string|null; created_at:string };
export type CvVersionState = { key:string; filename:string; uploadedAt:string; lastUpdatedAt:string; parseStatus:"Complete"|"Processing"|"Needs review"; extractionConfidence:"Confirmed"|"Mixed"|"Unknown"; active:boolean; rawFileRetained:boolean };
export type ExecutiveProfileState = { hasCv:boolean; hasStructuredProfile:boolean; activeCv?:CvVersionState; cvVersions:CvVersionState[]; confirmedRoleCount:number; atlasState:"Needs CV"|"Learning"|"Ready"; atlasHasEnoughContext:boolean; lastSuccessfulUpdate?:string };

const minuteBucket=(value:string)=>value.slice(0,16);
const filename=(session:CvImportSession)=>{const summaryName=typeof session.summary?.filename==="string"?session.summary.filename:undefined;return session.source_filename?.trim()||summaryName?.trim()||"Imported CV";};

export function deriveExecutiveProfileState(sessions:CvImportSession[],experiences:ProfileExperienceEvidence[]):ExecutiveProfileState{
  const completed=sessions.filter(session=>session.status==="Completed"&&session.stage==="Confirmed").sort((left,right)=>Date.parse(right.completed_at??right.created_at)-Date.parse(left.completed_at??left.created_at));
  const groups=new Map<string,CvImportSession[]>();
  for(const session of completed){const key=`${filename(session).toLowerCase()}|${minuteBucket(session.completed_at??session.created_at)}`;groups.set(key,[...(groups.get(key)??[]),session]);}
  const confirmed=experiences.filter(experience=>experience.confidence==="User Confirmed").length;
  const cvVersions=[...groups.entries()].map(([key,grouped])=>{const uploadedAt=grouped.map(item=>item.created_at).sort()[0];const lastUpdatedAt=grouped.map(item=>item.completed_at??item.created_at).sort().at(-1)??uploadedAt;return{key,filename:filename(grouped[0]),uploadedAt,lastUpdatedAt,parseStatus:"Complete" as const,extractionConfidence:confirmed?"Confirmed" as const:"Unknown" as const,active:false,rawFileRetained:grouped.some(item=>item.summary?.rawSourceRetained===true)};}).sort((left,right)=>Date.parse(right.lastUpdatedAt)-Date.parse(left.lastUpdatedAt));
  if(cvVersions[0])cvVersions[0]={...cvVersions[0],active:true};
  const activeCv=cvVersions[0],hasStructuredProfile=experiences.length>0;
  const latestExperience=experiences.map(experience=>experience.created_at).sort().at(-1);
  return{hasCv:Boolean(activeCv),hasStructuredProfile,activeCv,cvVersions,confirmedRoleCount:experiences.length,atlasState:hasStructuredProfile?"Ready":activeCv?"Learning":"Needs CV",atlasHasEnoughContext:hasStructuredProfile,lastSuccessfulUpdate:activeCv?.lastUpdatedAt??latestExperience};
}
