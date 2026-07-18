import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { confirmedExecutiveName } from "@/lib/auth/executive-display-name";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createRoomAction, joinRoomAction, respondInvitationAction } from "./actions";

type Room = { id:string; title:string; topic:string; short_purpose:string; language_name:string; status:string; is_temporary:boolean; closes_at?:string; updated_at:string; permanence_status:string; platform_managed:boolean; operator_label?:string };
type Membership = { room_id:string; role:string };
type Invitation = { id:string; room_id:string; intended_role:string; expires_at:string };
type Identity = { profile?:unknown };

export default async function RoomsPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/rooms");
  const client = createServerSupabaseClient(resolved.accessToken);
  const [roomsResponse, membershipsResponse, invitationsResponse, identityResponse] = await Promise.all([
    client.request<Room[]>("executive_rooms?select=id,title,topic,short_purpose,language_name,status,is_temporary,closes_at,updated_at,permanence_status,platform_managed,operator_label&order=platform_managed.desc,updated_at.desc"),
    client.request<Membership[]>(`executive_room_memberships?select=room_id,role&executive_identity_id=eq.${resolved.context.actorId}&status=eq.Active`),
    client.request<Invitation[]>(`executive_room_invitations?select=id,room_id,intended_role,expires_at&intended_identity_id=eq.${resolved.context.actorId}&status=eq.Pending&order=created_at.desc`),
    client.request<Identity[]>(`executive_identities?select=profile&id=eq.${resolved.context.actorId}&limit=1`),
  ]);
  const rooms = roomsResponse.data ?? [];
  const roles = new Map((membershipsResponse.data ?? []).map(item => [item.room_id,item.role]));
  const roomById = new Map(rooms.map(room => [room.id,room]));
  const notice = (await searchParams).notice;
  const displayName = confirmedExecutiveName(identityResponse.data?.[0]?.profile) ?? "Executive";

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Live executive community" title="Executive Rooms" description="Open conversations for verified ORENDALIS executives. Join any active room, contribute responsibly, and keep each discussion focused on its stated purpose." />
    {notice && <p role="status" className="mt-6 rounded-xl border border-[#b9d9c3] bg-[#edf8f0] px-4 py-3 text-sm text-[#285a37]">{notice}</p>}

    {(invitationsResponse.data ?? []).length > 0 && <section className="mt-8 rounded-2xl border border-[#c8d6e8] bg-[#f4f8fd] p-6">
      <p className="atlas-kicker">Invitations for {displayName}</p><h2 className="mt-2 text-2xl font-semibold text-[#0b1220]">You have been invited</h2>
      <div className="mt-4 space-y-3">{(invitationsResponse.data ?? []).map(invitation => <article key={invitation.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4"><div><p className="font-semibold">{roomById.get(invitation.room_id)?.title ?? "Private Executive Room"}</p><p className="mt-1 text-sm text-[#5f6b7a]">Role: {invitation.intended_role} · Expires {formatDate(invitation.expires_at)}</p></div><form action={respondInvitationAction} className="flex gap-2"><input type="hidden" name="invitationId" value={invitation.id}/><button name="decision" value="accept" className="rounded-full bg-[#0b1220] px-4 py-2 text-sm font-semibold text-white">Accept</button><button name="decision" value="decline" className="rounded-full border border-[#cbd3dc] px-4 py-2 text-sm font-semibold">Decline</button></form></article>)}</div>
    </section>}

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <div><div className="flex items-center justify-between"><div><p className="atlas-kicker">Room directory</p><h2 className="mt-2 text-2xl font-semibold">Join the conversation</h2></div><span className="rounded-full bg-[#eef2f5] px-3 py-1 text-xs font-semibold text-[#526070]">{rooms.length} rooms</span></div>
        <div className="mt-5 grid gap-4">{rooms.length ? rooms.map(room => <article key={room.id} className="rounded-2xl border border-[#dfe5ee] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-semibold text-[#0b1220]">{room.title}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#63758b]">{room.language_name}{room.platform_managed ? ` · ${room.operator_label ?? "Atlas"} administered` : ""}</p></div><div className="flex gap-2"><span className="rounded-full bg-[#edf2f7] px-3 py-1 text-xs font-semibold">{roles.get(room.id) ?? "Open"}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${room.permanence_status === "Permanent" ? "bg-[#e9f7ed] text-[#28613a]" : "bg-[#fff4d8] text-[#77520e]"}`}>{room.permanence_status === "PendingFounderApproval" ? "Temporary · Founder review" : room.permanence_status}</span></div></div><p className="mt-3 text-sm font-medium text-[#344152]">{room.short_purpose}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6d7784]">{room.topic}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#7a8592]">Updated {formatDate(room.updated_at)}{room.is_temporary ? ` · closes ${formatDate(room.closes_at)}` : ""}</p>{roles.has(room.id)?<Link href={`/rooms/${room.id}`} className="rounded-full bg-[#0b1220] px-4 py-2 text-sm font-semibold text-white">Open room</Link>:<form action={joinRoomAction}><input type="hidden" name="roomId" value={room.id}/><button className="rounded-full bg-[#0b1220] px-4 py-2 text-sm font-semibold text-white">Join room</button></form>}</div></article>) : <div className="rounded-2xl border border-dashed border-[#cbd3dc] bg-[#f8fafc] p-8"><h3 className="text-xl font-semibold">No rooms yet</h3><p className="mt-2 text-sm leading-6 text-[#5f6b7a]">Create a focused room when a decision needs trusted peers, shared evidence, and a clear record.</p></div>}</div>
      </div>
      <aside className="rounded-2xl border border-[#dfe5ee] bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:self-start"><p className="atlas-kicker">Create a room</p><h2 className="mt-2 text-2xl font-semibold">Start a focused conversation</h2><p className="mt-2 text-sm leading-6 text-[#5f6b7a]">Every verified executive can join. New rooms stay temporary until the Founder reviews the stated reason for permanence. Atlas remains silent unless explicitly asked.</p>
        <form action={createRoomAction} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Room title<input required minLength={3} maxLength={100} name="title" className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal" placeholder="European expansion decisions"/></label><label className="block text-sm font-semibold">Short purpose<input required minLength={10} maxLength={180} name="shortPurpose" className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal" placeholder="What this room is for"/></label><label className="block text-sm font-semibold">Room explanation<textarea required minLength={10} maxLength={600} name="topic" rows={4} className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal" placeholder="Describe the useful conversations this room should host."/></label><label className="block text-sm font-semibold">Room language<input name="language" required minLength={2} maxLength={80} defaultValue="English" list="room-languages" className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal"/><datalist id="room-languages">{["English","Turkish","German","French","Spanish","Italian","Portuguese","Arabic","Dutch","Japanese","Mandarin Chinese","Hindi","Russian","Polish","Greek","Bulgarian"].map(language=><option key={language} value={language}/>)}</datalist><span className="mt-1 block text-xs font-normal text-[#6d7784]">Choose a suggestion or enter any other language.</span></label><label className="block text-sm font-semibold">Why should this room become permanent?<textarea required minLength={20} maxLength={600} name="permanenceReason" rows={4} className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal" placeholder="Explain the durable value for the executive community."/></label><label className="block text-sm font-semibold">Temporary review date<input type="datetime-local" name="closesAt" className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal"/><span className="mt-1 block text-xs font-normal text-[#6d7784]">Defaults to 30 days if left blank.</span></label><button className="w-full rounded-full bg-[#0b1220] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2d45]">Create temporary room</button></form>
      </aside>
    </section>
  </main>;
}

function formatDate(value?:string) { if (!value) return "Not set"; const date=new Date(value); return Number.isNaN(date.getTime()) ? "Not set" : new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(date); }
