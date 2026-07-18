# Türkiye Coverage and Live Rooms Sprint — 2026-07-18

## Outcome

Live Rooms is now directly accessible beside the signed-in executive identity. Its status is derived from real activity: violet for an unanswered executive question, green for an active multi-executive discussion, yellow for recent presence without discussion, and red for no current presence. Presence is ephemeral, workspace/room isolated, and not exposed as history.

Türkiye is canonical in the country registry with `Turkey`, `Turkiye`, and `Türkiye` aliases. Eight employer-published Greenhouse and SmartRecruiters sources were independently verified and registered. No scraped, invented, failed, or inaccessible source was admitted.

## Measured Production Evidence

- Deployed implementation: `9ed7a74`
- Complete company-directory pagination: `34d02db`
- Canonical employers: 1,091
- Enabled employer sources: 1,176
- Canonical opportunities: 27,321
- Türkiye-located canonical opportunities: 22
- Türkiye-located canonical companies currently confirmed: 1
- First completed Türkiye cohort sources: Xometry Turkey, Constructor TECH, OLIVER Agency, VusionGroup
- Source records discovered by those four: 204
- Xometry replay: 6 rediscovered, 0 changed
- OLIVER replay: 74 rediscovered, 0 changed
- Provider failures in completed runs: 0
- Remaining admitted sources: Lostar, Digiterra, CRENNO, Blockville

## Validation

- Live `/rooms` shows the clickable Rooms control and `Cuneyt Sen` in the command bar.
- Live quiet state truthfully reports that no one is currently in Rooms.
- Live `/companies` searches `Türkiye`, lists the canonical Türkiye option, and returns Xometry Turkey with six opportunities.
- Live `/opportunities?q=Türkiye` returns Türkiye/Xometry evidence after loading.
- TypeScript, ESLint, production build, Rooms status tests, Türkiye cohort tests, scheduler tests, and company pagination tests passed.

## Security and Current Gate

The existing staging scheduler secret-key variable is absent from the current Vercel project configuration. New deployments therefore cannot perform privileged scheduler database writes. No public or client key was substituted. A new staging-only Supabase secret key was prepared through the official dashboard but was not exposed, logged, committed, or copied into Vercel. Founder secure transfer is required before the final four sources can run.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Executive Rooms | 🟡 Live presence ready | 90% | High | Validate one real decision room |
| Country Intelligence | 🟡 In Progress | 45% | High | Expand evidence-backed country briefings |
| Global employer expansion | 🟡 Scheduler key gate | 88% | Critical | Add the staging scheduler key to Vercel and finish four sources |
| Company Intelligence | 🟡 In Progress | 65% | Critical | Continue verified enrichment after scheduler recovery |
| Atlas Improvements | 🟡 In Progress | 58% | Critical | Use the expanded canonical evidence in explanations |
