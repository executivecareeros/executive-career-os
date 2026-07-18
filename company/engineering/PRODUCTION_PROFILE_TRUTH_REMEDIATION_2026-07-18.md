# Production Profile Truth Remediation — 2026-07-18

## Live evidence

Authenticated production validation found nine active professional-history records. Eight came from the Founder CV; one was the explicitly fictional `Aurora Meridian Group · Chief Strategy Officer` acceptance fixture.

## Risk

The fixture appeared as confirmed professional history and was therefore eligible to enter Atlas evidence. This is a critical executive-trust defect even though the original purpose was controlled acceptance testing.

## Remediation

- A bounded, reversible migration archives only the exact fictional employer, role and evidence phrase.
- No real CV record is matched by the cleanup condition.
- Existing immutable reasoning history remains preserved for audit; future reasoning excludes the archived record.
- Authenticated manual-entry examples no longer reuse the fictional acceptance identity.
- Home and Workspace describe the active object as the executive's confirmed career profile rather than presenting a filename as identity.
- All-uppercase confirmed names receive presentation casing without changing stored identity data.

## Acceptance

The bounded cleanup ran successfully against the Orendalis staging database on 2026-07-18. The verification query returned zero active fictional acceptance records. Production must now show eight active Founder roles, no Aurora Meridian record, a truthful confirmed-profile heading and `Cuneyt Sen` in the signed-in header. Atlas must query only active history.
