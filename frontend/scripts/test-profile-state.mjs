import assert from"node:assert/strict";
import{deriveExecutiveProfileState}from"../lib/profile/executive-profile-state.ts";
const sessions=[{id:"1",source_filename:"Executive-CV.pdf",status:"Completed",stage:"Confirmed",summary:{rawSourceRetained:false},created_at:"2026-07-17T10:00:01Z",completed_at:"2026-07-17T10:00:05Z"},{id:"2",source_filename:"Executive-CV.pdf",status:"Completed",stage:"Confirmed",summary:{rawSourceRetained:false},created_at:"2026-07-17T10:00:10Z",completed_at:"2026-07-17T10:00:12Z"}];
const state=deriveExecutiveProfileState(sessions,[{id:"role-1",confidence:"User Confirmed",created_at:"2026-07-17T10:00:10Z"}]);
assert.equal(state.hasCv,true);assert.equal(state.cvVersions.length,1,"One upload must not appear as multiple CVs when each confirmed role has its own import session");assert.equal(state.activeCv?.filename,"Executive-CV.pdf");assert.equal(state.activeCv?.rawFileRetained,false);assert.equal(state.atlasState,"Ready");assert.equal(state.confirmedRoleCount,1);
const empty=deriveExecutiveProfileState([],[]);assert.equal(empty.hasCv,false);assert.equal(empty.atlasState,"Needs CV");
console.log("Canonical executive profile state checks passed.");
