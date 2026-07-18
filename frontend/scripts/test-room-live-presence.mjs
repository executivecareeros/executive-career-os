import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root=join(import.meta.dirname,"..","..");
const migration=readFileSync(join(root,"supabase/migrations/202607180011_room_live_presence.sql"),"utf8");
const status=readFileSync(join(root,"frontend/components/rooms/rooms-status-link.tsx"),"utf8");
const heartbeat=readFileSync(join(root,"frontend/components/rooms/room-presence-heartbeat.tsx"),"utf8");
assert.match(migration,/last_seen_at>=now\(\)-interval '2 minutes'/);
assert.match(migration,/messages>=2 and authors>=2/);
assert.match(migration,/trim\(q\.body\) ~ '\\\?\$'/);
assert.match(migration,/not exists\(select 1 from public\.executive_room_messages reply where reply\.parent_message_id=q\.id/);
assert.match(migration,/revoke all on public\.executive_room_presence from public,anon,authenticated/);
for(const state of ["question","active","present","quiet"])assert.match(status,new RegExp(`${state}:`));
assert.match(status,/href="\/rooms"/);
assert.match(heartbeat,/45_000/);
console.log("Live Rooms presence, activity, question, privacy, and navigation checks passed.");
