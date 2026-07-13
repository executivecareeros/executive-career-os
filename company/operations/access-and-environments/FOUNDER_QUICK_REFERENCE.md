# Founder Quick Reference

> Purpose: Answer “Where is everything?” with one safe, current operational page.

## Current Systems

| Area | Provider / account | Current resource | State |
| --- | --- | --- | --- |
| Domain and DNS | Porkbun founder account | `orendalis.com` | Registered; security/renewal controls need verification |
| Company email | Microsoft 365 Orendalis tenant | `cuneyt.sen@orendalis.com` plus seven aliases | Exchange operational; DKIM case open |
| Source | GitHub founder account | `executivecareeros/executive-career-os`, branch `main` | Active; not in Orendalis org |
| Company GitHub | GitHub `Orendalis` organization | No company-owned repository documented | Free; one owner; 2FA enforcement pending |
| Legacy hosting | Vercel `executivecareeros' projects` | `executive-career-os`, `executive-career-os-play` | Hobby; unchanged |
| Staging hosting | Vercel `Orendalis` Pro | `orendalis-staging`; `https://project-qmvs1.vercel.app` | Repository connected; assigned hostname confirmed; no deployment, variables, or custom domain |
| Local database | Local Supabase | `executive-career-os-local` | Active; fictional data only |
| Staging database | Supabase `Orendalis` Pro | `orendalis-staging`; ref `ymprcckbrgkijnuwhdne`; Frankfurt | Healthy; no migrations; recent provider backup observed; Auth URLs not configured |
| AI work tools | OpenAI | ChatGPT Team; GPT Work / Codex | Use confirmed; account and billing details need verification |
| Monitoring / analytics | None | None | Not Configured |
| Legal / trademark provider | None evidenced | None | Not Configured |

## Environments and URLs

- **Local:** `http://localhost:3000`; local Supabase; fictional data only.
- **Staging:** Vercel and Supabase resources exist. Assigned origin: `https://project-qmvs1.vercel.app`; it has no deployment yet.
- **Production:** Not created or accepted. No real personal data is allowed.
- **Domain:** `orendalis.com`; no application custom hostname configured.
- **Supabase API origin:** provider-generated URL exists; consult the provider dashboard rather than copying values into documentation.

## Open Support Case

- Microsoft case `2607130050001139`: Exchange Online DKIM selector publication failure. Status last recorded **Open**. Do not change mail DNS or enable DKIM without controlled approval.

## Recurring Cost View

- Vercel Pro: **USD 20/month plus usage**.
- Supabase Pro: **from USD 25/month**.
- Published staging base: **from USD 45/month** before tax, currency conversion, add-ons, and usage.
- Porkbun renewal estimate recorded at purchase: **USD 11.08/year**; verify renewal settings.
- Microsoft 365, ChatGPT Team, and GPT Work / Codex: invoice and renewal details **Founder to Verify**.

## Critical Blockers

1. The controlled operations session cannot access the Supabase project that the founder can see in Safari.
2. Staging has no migrations, Auth Site URL/redirects, environment variables, or deployment.
3. Critical provider MFA, recovery, and backup-owner controls are not evidenced.
4. Microsoft DKIM remains blocked by an open support case.
5. Restore proof, monitoring, GitHub protection, and legal/private-beta readiness remain incomplete.

## Next Five Founder Actions

1. Sign the controlled browser into the Supabase account that owns `ymprcckbrgkijnuwhdne`, then complete Auth URL configuration and the ten migrations.
2. Configure the seven approved Vercel staging variables only after database acceptance.
3. Deploy staging and run the full fictional founder-acceptance journey.
4. Complete a staging backup-and-restore rehearsal and record measured recovery evidence.
5. Review Microsoft case `2607130050001139` and record the factual response without changing DNS prematurely.

Detailed authoritative records are in this folder. Never place credentials or recovery material in them.
