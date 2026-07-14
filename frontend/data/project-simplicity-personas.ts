export type SimplicityPersona = {
  id: string; role: string; industry: string; country: string; language: "en" | "tr";
  ageRange: string; urgency: "Exploring" | "Active" | "Urgent"; targetRole: string;
  locationPreference: string; workPreference: string; compensationContext: string;
  constraint: string; startsWithCv: boolean;
};

export const projectSimplicityPersonas: readonly SimplicityPersona[] = [
  { id:"ps-01", role:"Global VP Sales", industry:"Enterprise SaaS", country:"United Kingdom", language:"en", ageRange:"45–54", urgency:"Active", targetRole:"Chief Revenue Officer", locationPreference:"London or remote Europe", workPreference:"Hybrid", compensationContext:"GBP 280k+", constraint:"Protect family stability", startsWithCv:true },
  { id:"ps-02", role:"Chief Revenue Officer", industry:"Cybersecurity", country:"United States", language:"en", ageRange:"45–54", urgency:"Exploring", targetRole:"CEO", locationPreference:"United States", workPreference:"Hybrid", compensationContext:"USD 400k+", constraint:"Board quality matters", startsWithCv:false },
  { id:"ps-03", role:"International Sales Director", industry:"Broadcast Technology", country:"Türkiye", language:"tr", ageRange:"35–44", urgency:"Active", targetRole:"VP International Sales", locationPreference:"Europe or Middle East", workPreference:"Remote", compensationContext:"EUR 220k+", constraint:"Travel below 35%", startsWithCv:true },
  { id:"ps-04", role:"Commercial Director", industry:"Telecom", country:"Germany", language:"en", ageRange:"45–54", urgency:"Exploring", targetRole:"Managing Director", locationPreference:"DACH", workPreference:"Hybrid", compensationContext:"EUR 260k+", constraint:"No permanent relocation", startsWithCv:false },
  { id:"ps-05", role:"Business Development Director", industry:"Defense Technology", country:"France", language:"en", ageRange:"45–54", urgency:"Active", targetRole:"VP Business Development", locationPreference:"EU and NATO markets", workPreference:"On-site", compensationContext:"EUR 240k+", constraint:"Employer integrity", startsWithCv:true },
  { id:"ps-06", role:"Head of Partnerships", industry:"Fintech", country:"Türkiye", language:"tr", ageRange:"35–44", urgency:"Active", targetRole:"Chief Commercial Officer", locationPreference:"Istanbul or remote", workPreference:"Hybrid", compensationContext:"Open", constraint:"Regulatory culture", startsWithCv:false },
  { id:"ps-07", role:"Regional Sales Director", industry:"Cloud Infrastructure", country:"Singapore", language:"en", ageRange:"35–44", urgency:"Urgent", targetRole:"APAC VP Sales", locationPreference:"Singapore", workPreference:"Hybrid", compensationContext:"SGD 350k+", constraint:"School continuity", startsWithCv:true },
  { id:"ps-08", role:"General Manager", industry:"AI Software", country:"Netherlands", language:"en", ageRange:"45–54", urgency:"Exploring", targetRole:"Regional CEO", locationPreference:"Benelux", workPreference:"Hybrid", compensationContext:"EUR 300k+", constraint:"Responsible AI governance", startsWithCv:true },
  { id:"ps-09", role:"Enterprise Account Director", industry:"Professional Services", country:"Spain", language:"en", ageRange:"35–44", urgency:"Active", targetRole:"VP Sales", locationPreference:"Spain or remote Europe", workPreference:"Remote", compensationContext:"EUR 190k+", constraint:"First executive mandate", startsWithCv:false },
  { id:"ps-10", role:"Former Commercial VP", industry:"Consumer Technology", country:"Türkiye", language:"tr", ageRange:"45–54", urgency:"Exploring", targetRole:"Commercial Director", locationPreference:"Istanbul", workPreference:"Hybrid", compensationContext:"Flexible", constraint:"Returning after career break", startsWithCv:true },
] as const;
