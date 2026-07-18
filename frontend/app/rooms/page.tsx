import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { confirmedExecutiveName } from "@/lib/auth/executive-display-name";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createRoomAction, respondInvitationAction } from "./actions";

type Room = { id:string; title:string; topic:string; status:string; is_temporary:boolean; closes_at?:string; updated_at:string };
type Membership = { room_id:string; role:string };
type Invitation = { id:string; room_id:string; intended_role:string; expires_at:string };
type Identity = { profile?:unknown };

export default async function RoomsPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/rooms");
  const client = createServerSupabaseClient(resolved.accessToken);
  const [roomsResponse, membershipsResponse, invitationsResponse, identityResponse] = await Promise.all([
    client.request<Room[]>("executive_rooms?select=id,title,topic,status,is_temporary,closes_at,updated_at&order=updated_at.desc"),
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
    <PageHeader eyebrow="Private executive collaboration" title="Executive Rooms" description="Focused, invitation-only conversations for decisions that deserve trusted context—not another public feed." />
    {notice && <p role="status" className="mt-6 rounded-xl border border-[#b9d9c3] bg-[#edf8f0] px-4 py-3 text-sm text-[#285a37]">{notice}</p>}

    {(invitationsResponse.data ?? []).length > 0 && <section className="mt-8 rounded-2xl border border-[#c8d6e8] bg-[#f4f8fd] p-6">
      <p className="atlas-kicker">Invitations for {displayName}</p><h2 className="mt-2 text-2xl font-semibold text-[#0b1220]">You have been invited</h2>
      <div className="mt-4 space-y-3">{(invitationsResponse.data ?? []).map(invitation => <article key={invitation.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4"><div><p className="font-semibold">{roomById.get(invitation.room_id)?.title ?? "Private Executive Room"}</p><p className="mt-1 text-sm text-[#5f6b7a]">Role: {invitation.intended_role} · Expires {formatDate(invitation.expires_at)}</p></div><form action={respondInvitationAction} className="flex gap-2"><input type="hidden" name="invitationId" value={invitation.id}/><button name="decision" value="accept" className="rounded-full bg-[#0b1220] px-4 py-2 text-sm font-semibold text-white">Accept</button><button name="decision" value="decline" className="rounded-full border border-[#cbd3dc] px-4 py-2 text-sm font-semibold">Decline</button></form></article>)}</div>
    </section>}

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <div><div className="flex items-center justify-between"><div><p className="atlas-kicker">Your rooms</p><h2 className="mt-2 text-2xl font-semibold">Private decision spaces</h2></div><span className="rounded-full bg-[#eef2f5] px-3 py-1 text-xs font-semibold text-[#526070]">{rooms.length} total</span></div>
        <div className="mt-5 grid gap-4">{rooms.length ? rooms.map(room => <Link key={room.id} href={`/rooms/${room.id}`} className="group rounded-2xl border border-[#dfe5ee] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9eb3ca] hover:shadow-md"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-semibold text-[#0b1220]">{room.title}</h3><div className="flex gap-2"><span className="rounded-full bg-[#edf2f7] px-3 py-1 text-xs font-semibold">{roles.get(room.id) ?? "Member"}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${room.status === "Active" ? "bg-[#e9f7ed] text-[#28613a]" : "bg-[#f1f2f3] text-[#626970]"}`}>{room.status}</span></div></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5f6b7a]">{room.topic}</p><p className="mt-5 text-xs text-[#7a8592]">Updated {formatDate(room.updated_at)}{room.is_temporary ? ` · closes ${formatDate(room.closes_at)}` : ""}</p></Link>) : <div className="rounded-2xl border border-dashed border-[#cbd3dc] bg-[#f8fafc] p-8"><h3 className="text-xl font-semibold">No rooms yet</h3><p className="mt-2 text-sm leading-6 text-[#5f6b7a]">Create a focused room when a decision needs trusted peers, shared evidence, and a clear record.</p></div>}</div>
      </div>
      <aside className="rounded-2xl border border-[#dfe5ee] bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:self-start"><p className="atlas-kicker">Create a room</p><h2 className="mt-2 text-2xl font-semibold">Start with a decision</h2><p className="mt-2 text-sm leading-6 text-[#5f6b7a]">Only invited, verified Orendalis executives can enter. Atlas remains silent unless explicitly asked.</p>
        <form action={createRoomAction} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Room title<input required minLength={3} maxLength={100} name="title" className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal" placeholder="European expansion decision"/></label><label className="block text-sm font-semibold">Decision topic<textarea required minLength={10} maxLength={600} name="topic" rows={5} className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal" placeholder="What should this group help decide?"/></label><label className="flex items-start gap-3 rounded-xl bg-[#f7f9fb] p-4 text-sm"><input type="checkbox" name="temporary" className="mt-1"/><span><strong>Temporary room</strong><span className="mt-1 block text-[#5f6b7a]">Closes on a defined date.</span></span></label><label className="block text-sm font-semibold">Close date (temporary rooms only)<input type="datetime-local" name="closesAt" className="mt-2 w-full rounded-xl border border-[#cbd3dc] px-4 py-3 font-normal"/></label><button className="w-full rounded-full bg-[#0b1220] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2d45]">Create private room</button></form>
      </aside>
    </section>
  </main>;
}

function formatDate(value?:string) { if (!value) return "Not set"; const date=new Date(value); return Number.isNaN(date.getTime()) ? "Not set" : new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(date); }
