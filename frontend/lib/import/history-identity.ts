export function normalizeHistoryIdentity(value:string){
  return value.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/&/g," and ").replace(/\band\b/g,"and").replace(/[^a-z0-9]+/g,"");
}

export function historyIdentityKey(input:{organizationName:string;roleTitle:string;startDate?:string}){
  return `${normalizeHistoryIdentity(input.organizationName)}|${normalizeHistoryIdentity(input.roleTitle)}|${input.startDate?.slice(0,7)??""}`;
}
