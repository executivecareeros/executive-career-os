import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"../..");
const migration=await readFile(path.join(root,"supabase/migrations/202607180013_room_governance_and_atlas_directory.sql"),"utf8");
const rooms=await readFile(path.join(root,"frontend/app/rooms/page.tsx"),"utf8");
const room=await readFile(path.join(root,"frontend/app/rooms/[roomId]/page.tsx"),"utf8");
const control=await readFile(path.join(root,"frontend/components/company-control/company-control-center.tsx"),"utf8");
const actions=await readFile(path.join(root,"frontend/app/rooms/actions.ts"),"utf8");

assert.match(migration,/PendingFounderApproval/);
assert.match(migration,/get_founder_room_permanence_requests/);
assert.match(migration,/is_configured_founder/);
assert.match(migration,/executive_room_permanence_decisions_append_only/);
assert.match(migration,/join_executive_room/);
assert.match(migration,/status='Active' and public\.current_executive_identity_id\(\) is not null/);
assert.match(migration,/ServiceMarketplace/);
for(const field of ["serviceCategory","city","country"])assert.match(migration,new RegExp(field));
for(const title of ["Opportunities","Executive Questions","ORENDALIS Café","Local Services Marketplace","Leadership Decisions","Career Transitions","Company Intelligence","Executive Technology & AI","Global Markets","Wellbeing & Sustainable Leadership"])assert.match(migration,new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
assert.match(rooms,/enter any other language/);
assert.match(rooms,/Join room/);
assert.match(rooms,/Founder review/);
assert.match(room,/serviceCategory/);
assert.match(control,/Room Permanence Decisions/);
assert.match(control,/Make permanent/);
assert.match(actions,/decide_room_permanence/);
assert.match(actions,/post_executive_room_message_v2/);
console.log("Room governance, open membership, language, Atlas directory, service classification, and Founder approval checks passed.");
