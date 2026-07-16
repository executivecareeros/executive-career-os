"use client";
/* The review payload mirrors several optional CV schemas; the small adapter below intentionally keeps that boundary dynamic. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import type { HistoryDocumentDraft } from "@/lib/import/history-drafts";
import { confirmCvHistory } from "@/app/import/actions";

type Extraction = { filename: string; format: string; drafts: HistoryDocumentDraft[]; warnings: string[]; profile?: { fullName?: string; headline?: string; summary?: string; citizenship?: string; contact?: string; linkedin?: string }; highlights?: string[]; education?: Array<{ institution: string; qualification?: string; minor?: string; startYear?: string; endYear?: string; evidence: string }>; languages?: Array<{ language: string; proficiency?: string; native?: boolean; evidence: string }>; skills?: Array<{ name: string; category: string; evidence: string }> };

export function ImportWorkspace({ locale = "en" }: { locale?: Locale }) {
  const tr = locale === "tr";
  const [extraction, setExtraction] = useState<Extraction>();
  const [drafts, setDrafts] = useState<HistoryDocumentDraft[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [profile, setProfile] = useState<NonNullable<Extraction["profile"]>>({});
  const [highlights, setHighlights] = useState<string[]>([]);
  const [education, setEducation] = useState<NonNullable<Extraction["education"]>>([]);
  const [languages, setLanguages] = useState<NonNullable<Extraction["languages"]>>([]);
  const [skills, setSkills] = useState<NonNullable<Extraction["skills"]>>([]);
  const [customSections, setCustomSections] = useState<string[]>([]);

  async function extract(file?: File) {
    if (!file) return;
    setBusy(true); setError(undefined); setExtraction(undefined); setDrafts([]); setProfile({}); setHighlights([]); setEducation([]); setLanguages([]); setSkills([]); setCustomSections([]);
    try {
      const body = new FormData(); body.set("file", file);
      const response = await fetch("/api/import/extract", { method: "POST", body });
      const result = await response.json() as Extraction & { error?: string };
      if (!response.ok) throw new Error(result.error || (tr ? "CV güvenli biçimde okunamadı." : "Your CV could not be read safely."));
      setExtraction(result); setDrafts(result.drafts); setProfile(result.profile ?? {}); setHighlights(result.highlights ?? []); setEducation(result.education ?? []); setLanguages(result.languages ?? []); setSkills(result.skills ?? []); setCustomSections([]);
    } catch (reason) { setError(tr ? localizeExtractionError(reason) : reason instanceof Error ? reason.message : "Your CV could not be read safely."); }
    finally { setBusy(false); }
  }

  function update(id: string, change: Partial<HistoryDocumentDraft>) { setDrafts(items => items.map(item => item.id === id ? { ...item, ...change } : item)); }
  function addRole() { setDrafts(items => [...items, { id: crypto.randomUUID(), organizationName: "", roleTitle: "", isCurrent: false, confidence: "Low", evidence: "Added by executive during review" }]); }
  const ready = Boolean(extraction && consent && drafts.length && drafts.every(item => item.organizationName.trim() && item.roleTitle.trim()));

  return <main className="mx-auto max-w-5xl px-5 py-8 text-[#17191c] sm:px-8">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#936b3f]">{tr ? "CV incelemesi" : "CV review"}</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{tr ? "CV'ni yükle. Temel bilgileri birlikte doğrulayalım." : "Upload your CV. Then confirm the essentials."}</h1>
    <p className="mt-4 max-w-3xl leading-7 text-[#626970]">{tr ? "Atlas deneyimini özel çalışma alanında düzenlemek için rol ve şirket bilgilerini çıkarır. Eksik ayrıntılar iş aramana engel olmaz." : "Atlas extracts roles and employers so your experience can be organized privately. Missing details will not block your job search."}</p>

    <section className="mt-8 rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm sm:p-7">
      <label className="block cursor-pointer rounded-2xl border border-dashed border-[#d8d0c5] bg-[#faf6ef] p-8 text-center focus-within:ring-2 focus-within:ring-[#936b3f]">
        <span className="block text-lg font-semibold">{busy ? (tr ? "CV okunuyor…" : "Reading your CV…") : (tr ? "CV veya özgeçmiş seç" : "Choose your CV or resume")}</span>
        <span className="mt-2 block text-sm text-[#747b82]">{tr ? "PDF, DOCX, TXT, Markdown, CSV veya JSON · en fazla 5 MB" : "PDF, DOCX, TXT, Markdown, CSV or JSON · up to 5 MB"}</span>
        <span className="mt-5 inline-flex items-center rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold shadow-sm" style={{ color: "#ffffff" }}>{busy ? "Reading…" : "Choose a file"}</span>
        <input aria-label="Choose a CV or resume file" disabled={busy} type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" onChange={event => extract(event.target.files?.[0])} style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
      </label>
      <div className="mt-5 rounded-xl bg-[#f3f5f5] p-4 text-sm leading-6 text-[#626970]"><strong className="text-[#30343a]">{tr ? "Gizlilik:" : "Privacy:"}</strong> {tr ? "Dosyan yalnızca inceleme taslağı oluşturmak için okunur. Ham dosya saklanmaz; yalnızca onayladığın yapılandırılmış bilgiler kaydedilir." : "Your file is read only to create a review draft. The raw file is not retained; only the structured facts you confirm are saved."}</div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    </section>

    {extraction && <form action={confirmCvHistory} className="mt-7">
      <input type="hidden" name="filename" value={extraction.filename}/>
      <input type="hidden" name="drafts" value={JSON.stringify(drafts)}/><input type="hidden" name="documentContext" value={JSON.stringify({ profile, highlights, education, languages, skills, customSections })}/>
      <section className="rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-[#835c34]">{extraction.filename} · {extraction.format}</p><h2 className="mt-2 text-xl font-semibold">{tr ? "Atlas'ın bulduğu deneyimi doğrula" : "Confirm the experience Atlas found"}</h2><p className="mt-2 text-sm leading-6 text-[#6f757b]">{tr ? "Yalnızca doğru olduğunu bildiğin bilgileri onayla. Her alanı şimdi doldurman gerekmez." : "Confirm only what you know is correct. You do not need to complete every detail now."}</p></div><span className="rounded-full bg-[#eee2d2] px-3 py-1 text-xs font-medium text-[#704b28]">{drafts.length} {tr ? "rol" : drafts.length === 1 ? "role" : "roles"}</span></div>
        <ProfileReview tr={tr} profile={profile} setProfile={setProfile} highlights={highlights} setHighlights={setHighlights} education={education} setEducation={setEducation} languages={languages} setLanguages={setLanguages} skills={skills} setSkills={setSkills} customSections={customSections} setCustomSections={setCustomSections}/>
        {drafts.length ? <div className="mt-6 space-y-4">{drafts.map((draft, index) => <RoleReviewCard key={draft.id} draft={draft} index={index} tr={tr} update={update} remove={() => setDrafts(items => items.filter(item => item.id !== draft.id))} />)}</div> : <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{tr ? "CV'den güvenilir bir rol çıkarılamadı. Aşağıdan temel rolünü ekleyebilirsin; iş aramaya yine devam edebilirsin." : "No role could be extracted reliably. Add an essential role below, or continue searching jobs without it."}</p>}
        {extraction.warnings.map(warning => <p key={warning} className="mt-4 text-sm text-[#747b82]">{tr ? "Atlas bazı ayrıntıları güvenle çıkaramadı. Kaydetmeden önce aşağıdaki bilgileri gözden geçir." : warning}</p>)}
        <button type="button" onClick={addRole} className="mt-5 rounded-xl border border-[#d9dcde] bg-white px-4 py-2.5 text-sm font-medium">{tr ? "Rol ekle" : "Add a role"}</button>
        <label className="mt-6 flex items-start gap-3 rounded-xl bg-[#f3f5f5] p-4 text-sm leading-6 text-[#565c62]"><input name="consent" value="yes" type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 h-4 w-4"/><span>{tr ? "Bu doğrulanmış bilgilerin özel çalışma alanıma kaydedilmesini onaylıyorum. Ham dosyanın saklanmayacağını anlıyorum." : "I consent to saving these confirmed facts in my private workspace. I understand that the raw file will not be retained."}</span></label>
        <div className="mt-6 flex flex-wrap gap-3"><button disabled={!ready} className="rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-[#b7bbbe]" style={{ color: "#ffffff" }}>{tr ? "Deneyimimi kaydet ve işleri gör" : "Save my experience and see jobs"}</button><Link href="/opportunities" className="rounded-xl border border-[#d9dcde] px-5 py-3 text-sm font-semibold">{tr ? "Şimdilik geç ve iş ara" : "Skip for now and search jobs"}</Link></div>
      </section>
    </form>}
  </main>;
}

function Field({ label, value, onChange, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) { return <label className="text-sm font-medium text-[#30343a]">{label}<input required={type === "text"} disabled={disabled} type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm disabled:bg-[#eceeef]"/></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-sm font-medium text-[#30343a]">{label}<textarea rows={3} value={value} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm leading-6"/></label>; }
function splitLines(value: string) { return value.split(String.fromCharCode(10)).map(item => item.trim()).filter(Boolean); }
function RoleReviewCard({ draft, index, tr, update, remove }: { draft: HistoryDocumentDraft; index: number; tr: boolean; update: (id: string, change: Partial<HistoryDocumentDraft>) => void; remove: () => void }) {
  return <article className="rounded-2xl border border-[#e5e7e8] bg-[#fafafa] p-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={tr ? "Şirket" : "Company"} value={draft.organizationName} onChange={value => update(draft.id, { organizationName: value })}/>
      <Field label={tr ? "Rol" : "Role"} value={draft.roleTitle} onChange={value => update(draft.id, { roleTitle: value })}/>
      <Field label={tr ? "Başlangıç" : "Start"} type="month" value={draft.startDate ?? ""} onChange={value => update(draft.id, { startDate: value || undefined })}/>
      <Field label={tr ? "Bitiş" : "End"} type="month" value={draft.endDate ?? ""} disabled={draft.isCurrent} onChange={value => update(draft.id, { endDate: value || undefined })}/>
    </div>
    <div className="mt-4 grid gap-4">
      <TextArea label={tr ? "Şirket açıklaması" : "Company description"} value={draft.companyDescription ?? ""} onChange={value => update(draft.id, { companyDescription: value })}/>
      <TextArea label={tr ? "Rol açıklaması" : "Role description"} value={draft.roleDescription ?? ""} onChange={value => update(draft.id, { roleDescription: value })}/>
      <TextArea label={tr ? "Sorumluluklar (satır başına bir tane)" : "Responsibilities (one per line)"} value={(draft.responsibilities ?? []).join("\n")} onChange={value => update(draft.id, { responsibilities: splitLines(value) })}/>
      <TextArea label={tr ? "Başarılar (satır başına bir tane)" : "Achievements (one per line)"} value={(draft.achievements ?? []).join("\n")} onChange={value => update(draft.id, { achievements: splitLines(value) })}/>
    </div>
    <p className="mt-3 text-xs leading-5 text-[#706c66]">{tr ? "Kaynak kanıtı" : "Source evidence"}: {draft.evidence}</p>
    <div className="mt-4 flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-sm text-[#565c62]"><input type="checkbox" checked={draft.isCurrent} onChange={event => update(draft.id, { isCurrent: event.target.checked, endDate: event.target.checked ? undefined : draft.endDate })}/>{tr ? "Halen bu roldeyim" : "I currently hold this role"}</label><button type="button" onClick={remove} className="rounded-lg px-2 py-1 text-sm text-[#7a4d4d]">{tr ? "Kaldır" : "Remove"} {index + 1}</button></div>
  </article>;
}
function ProfileReview({ tr, profile, setProfile, highlights, setHighlights, education, setEducation, languages, setLanguages, skills, setSkills, customSections, setCustomSections }: any) {
  const update=(key:string,value:string)=>setProfile((current:any)=>({...current,[key]:value}));
  return <section className="mt-6 space-y-6 rounded-2xl border border-[#e5ddd1] bg-[#fffdf9] p-5"><div><h3 className="text-lg font-semibold">{tr ? "Profil ve yönetici özeti" : "Executive profile"}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><TextArea label={tr?"Ad soyad":"Full name"} value={profile.fullName??""} onChange={value=>update("fullName",value)}/><TextArea label={tr?"Profesyonel başlık":"Professional headline"} value={profile.headline??""} onChange={value=>update("headline",value)}/><TextArea label={tr?"Yönetici profili":"Executive profile"} value={profile.summary??""} onChange={value=>update("summary",value)}/><TextArea label={tr?"Vatandaşlık / çalışma izni":"Citizenship / work authorization"} value={profile.citizenship??""} onChange={value=>update("citizenship",value)}/><TextArea label={tr?"İletişim":"Contact details"} value={profile.contact??""} onChange={value=>update("contact",value)}/><TextArea label="LinkedIn URL" value={profile.linkedin??""} onChange={value=>update("linkedin",value)}/></div></div><EditableList title={tr?"Kariyer öne çıkanları":"Career highlights"} items={highlights} setItems={setHighlights} placeholder={tr?"Öne çıkan başarı":"Career highlight"}/><EditableList title={tr?"Eğitim":"Education"} items={education.map((item:any)=>`${item.institution}${item.qualification?` — ${item.qualification}`:""}${item.minor?` · ${item.minor}`:""}`)} setItems={(items:string[])=>setEducation(items.map(value=>({institution:value,evidence:"Edited by executive"})))} placeholder={tr?"Kurum ve derece":"Institution and degree"}/><EditableList title={tr?"Diller":"Languages"} items={languages.map((item:any)=>`${item.language}${item.proficiency?` — ${item.proficiency}`:""}`)} setItems={(items:string[])=>setLanguages(items.map(value=>{const [language,...rest]=value.split("—");return{language:language.trim(),proficiency:rest.join("—").trim(),evidence:"Edited by executive"};}))} placeholder={tr?"Dil — yeterlilik":"Language — proficiency"}/><EditableList title={tr?"Beceriler ve yetkinlikler":"Skills and competencies"} items={skills.map((item:any)=>item.name)} setItems={(items:string[])=>setSkills(items.map(name=>({name,category:"Executive",evidence:"Edited by executive"})))} placeholder={tr?"Yetkinlik":"Competency"}/><EditableList title={tr?"Ek bilgiler":"Additional executive information"} items={customSections} setItems={setCustomSections} placeholder={tr?"Ek bölüm":"Additional section"}/></section>;
}
function EditableList({ title, items, setItems, placeholder }: { title: string; items: string[]; setItems: (items: string[]) => void; placeholder: string }) { return <section><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{title}</h3><button type="button" onClick={()=>setItems([...items, ""])} className="rounded-full border border-[#d8d0c5] px-3 py-1.5 text-xs font-semibold">Add</button></div><div className="mt-3 space-y-2">{items.map((item,index)=><div key={`${title}-${index}`} className="flex gap-2"><input aria-label={`${title} ${index+1}`} value={item} placeholder={placeholder} onChange={event=>setItems(items.map((current,i)=>i===index?event.target.value:current))} className="min-w-0 flex-1 rounded-xl border border-[#d9dcde] bg-white px-3 py-2.5 text-sm"/><button type="button" aria-label={`Remove ${title} ${index+1}`} onClick={()=>setItems(items.filter((_,i)=>i!==index))} className="rounded-xl px-3 text-sm text-[#7a4d4d]">Remove</button></div>)}</div></section>; }

function localizeExtractionError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : "";
  if (message.includes("Unsupported file type")) return "Bu dosya türü desteklenmiyor. PDF, DOCX, TXT, Markdown, CSV veya JSON yükle.";
  if (message.includes("exceeds")) return "Dosya 5 MB sınırını aşıyor.";
  if (message.includes("readable text")) return "Bu dosyada okunabilir metin bulunamadı.";
  return "CV güvenli biçimde okunamadı. Dosyayı kontrol edip yeniden dene.";
}
