# ADR-007: Demo Data Isolation
> Purpose: Prevent fictional demonstration records from appearing as executive-owned data.

Memory-demo may use explicitly labelled fictional datasets. Supabase mode resolves only authenticated Workspace repositories; empty Workspaces stay empty and receive setup UI. There is no fallback from an authenticated empty result to demo imports.
