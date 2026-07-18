import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const migration=await readFile(path.join(root,"supabase/migrations/202607180008_executive_rooms_mvp.sql"),"utf8");
const roomsPage=await readFile(path.join(root,"frontend/app/rooms/page.tsx"),"utf8");
const roomPage=await readFile(path.join(root,"frontend/app/rooms/[roomId]/page.tsx"),"utf8");
const actions=await readFile(path.join(root,"frontend/app/rooms/actions.ts"),"utf8");
const navigation=await readFile(path.join(root,"frontend/lib/navigation.ts"),"utf8");

for(const table of ["executive_rooms","executive_room_memberships","executive_room_invitations","executive_room_messages","executive_room_pins","executive_room_bookmarks","executive_room_moderation_events"]){
  assert.match(migration,new RegExp(`alter table public\\.${table} enable row level security`),`${table} must enforce RLS`);
}
assert.match(migration,/is_active_room_member/);
assert.match(migration,/has_room_role/);
assert.match(migration,/Only the room owner can invite members/);
assert.match(migration,/intended_identity_id<>actor/);
assert.match(migration,/Archived rooms are read only/);
assert.match(migration,/Ambient monitoring is disabled/);
assert.match(migration,/source_message_ids/);
assert.match(migration,/get_room_member_directory/);
assert.doesNotMatch(migration,/identities_room_peer_read/);
assert.match(migration,/retention_days integer not null default 90/);
assert.match(migration,/reject_append_only_mutation/);
assert.doesNotMatch(migration,/public discovery|service.role|service_role/i);

assert.match(roomsPage,/Open conversations for verified ORENDALIS executives/i);
assert.match(roomsPage,/Every verified executive can join/i);
assert.match(roomsPage,/Atlas remains silent unless explicitly asked/i);
assert.match(roomPage,/Atlas is not monitoring this room/i);
assert.match(roomPage,/Sources preserved/);
assert.match(roomPage,/90-day bounded archive window/);
assert.match(roomPage,/verified.*executive/i);
assert.match(actions,/resolveAuthenticatedRepositoryContext/);
assert.match(actions,/"create_executive_room_v2"/);
assert.match(actions,/revalidatePath/);
assert.match(navigation,/label: "Rooms", href: "\/rooms"/);

console.log("Executive Rooms contract: PASS");
