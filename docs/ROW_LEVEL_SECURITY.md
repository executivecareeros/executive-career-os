# Row Level Security
> **Purpose:** Define workspace isolation and permission behavior for normal authenticated database access.
## Default
RLS is enabled on every exposed table. A user must map through `executive_identities.auth_user_id` to an active, non-archived workspace membership. Invitations grant no access.
## Policies
Members may read their workspaces and workspace-owned records. Inserts require active membership. Workspace ownership updates require the owner. Membership and invitation management require explicit permissions. Compensation uses an independent `View Compensation` permission.
## Append-Only Records
RLS grants reads/inserts where appropriate but no update/delete policies. Database triggers additionally reject ordinary UPDATE and DELETE operations.
## Security Definer Helpers
Small helper functions evaluate active membership and explicit permission without recursive policies. Their search path is fixed, public execution is revoked, and only the authenticated role may execute them.
## Limitations
Policies were statically inspected, not executed against a local PostgreSQL runtime. Authentication, token issuance, claims validation, multi-workspace tests, and privileged administrative procedures remain future work.
