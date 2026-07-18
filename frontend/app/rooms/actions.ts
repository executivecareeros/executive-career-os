"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function rpc<T>(name: string, body: Record<string, unknown>) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/rooms");
  const response = await createServerSupabaseClient(resolved.accessToken).request<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

function value(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export async function createRoomAction(formData: FormData) {
  const title = value(formData, "title", 100);
  const topic = value(formData, "topic", 600);
  const temporary = formData.get("temporary") === "on";
  const closesAt = value(formData, "closesAt", 40) || null;
  const roomId = await rpc<string>("create_executive_room", { room_title: title, room_topic: topic, temporary, requested_closes_at: closesAt });
  revalidatePath("/rooms");
  redirect(`/rooms/${roomId}`);
}

export async function inviteMemberAction(formData: FormData) {
  const roomId = value(formData, "roomId", 36);
  await rpc("invite_verified_room_member", { target_room: roomId, recipient_email: value(formData, "email", 254), requested_role: value(formData, "role", 20) || "Participant" });
  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}?notice=Invitation%20sent`);
}

export async function respondInvitationAction(formData: FormData) {
  const invitationId = value(formData, "invitationId", 36);
  const accepted = formData.get("decision") === "accept";
  const roomId = await rpc<string>("respond_to_room_invitation", { target_invitation: invitationId, accept_invitation: accepted });
  revalidatePath("/rooms");
  redirect(accepted ? `/rooms/${roomId}` : "/rooms?notice=Invitation%20declined");
}

export async function postRoomMessageAction(formData: FormData) {
  const roomId = value(formData, "roomId", 36);
  await rpc("post_executive_room_message", { target_room: roomId, message_body: value(formData, "body", 4000), reply_to: value(formData, "replyTo", 36) || null });
  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}#discussion`);
}

export async function toggleBookmarkAction(formData: FormData) {
  const roomId = value(formData, "roomId", 36);
  await rpc("toggle_room_bookmark", { target_room: roomId, target_message: value(formData, "messageId", 36) });
  revalidatePath(`/rooms/${roomId}`);
}

export async function togglePinAction(formData: FormData) {
  const roomId = value(formData, "roomId", 36);
  await rpc("toggle_room_pin", { target_room: roomId, target_message: value(formData, "messageId", 36) });
  revalidatePath(`/rooms/${roomId}`);
}

export async function invokeAtlasAction(formData: FormData) {
  const roomId = value(formData, "roomId", 36);
  await rpc("invoke_room_atlas", { target_room: roomId, request_text: value(formData, "request", 500) });
  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}?notice=Atlas%20request%20recorded#discussion`);
}

export async function archiveRoomAction(formData: FormData) {
  const roomId = value(formData, "roomId", 36);
  await rpc("archive_executive_room", { target_room: roomId });
  revalidatePath("/rooms");
  redirect("/rooms?notice=Room%20archived");
}
