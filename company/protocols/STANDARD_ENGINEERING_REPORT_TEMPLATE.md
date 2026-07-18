# Standard Engineering Report Template

> Required after every substantial sprint. Use evidence, not narrative confidence. Write **Unknown** when unavailable and state how it will be measured.

## 1. Outcome
## 2. Highest-ROI Finding
## 3. Founder Value Delivered
## 4. Implementation
## 5. User-Facing Changes
## 6. Internal Changes
## 7. ODS 4.0 Compliance
## 8. Founder Backlog Changes
## 9. Architecture Review
## 10. Company Intelligence Review
## 11. Opportunity Intelligence Review
## 12. Atlas Review
## 13. Website and UX Review
## 14. Branding and Logo Review
## 15. Executive Rooms Review
## 16. Performance Evidence

Report latency distributions, throughput, database/network time, memory and CPU when affected. Distinguish simulation, staging and production.

## 17. Security Review
## 18. Observability Review
## 19. CFO Cost Review

Include infrastructure, AI, storage, bandwidth, operations, maintenance, scaling and lower-cost alternatives.

## 20. AI Token Usage

Target `0`. If non-zero, document why deterministic/cache/fingerprint/reuse paths could not deliver equivalent value.

## 21. Tests and Validation
## 22. Risks
## 23. Technical Debt Added
## 24. Technical Debt Removed
## 25. Rollback Plan
## 26. Commit
## 27. Repository Status
## 28. Staging Status
## 29. Production Status
## 30. Screenshots or Visual Evidence

Required for user-facing work; include tested commit, viewport and route. Historical screenshots are not current evidence.

## 31. Founder Backlog Dashboard

This dashboard is mandatory at the end of every cycle report. It must use the current authoritative facts in `FOUNDER_BACKLOG.md`, never example or aspirational percentages. Consolidated rows may group related backlog IDs, but must use the least-complete material state and name the immediate next action.

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|

Status labels: `🟢 Complete`, `🟠 Founder Review Required`, `🟡 In Progress`, `🔴 Not Started`, `⚪ Planned`, or `⛔ Blocked`.

## 32. Top 10 Highest-ROI Remaining Tasks
## 33. Recommended Next Sprint

Explain why now, alternatives rejected, business/Founder/technical value, cost, duration, risks and measurable success criteria.

## 34. Questions Requiring Founder Decision
## 35. Final CTO Recommendation

## Completion gate

- Tests and evidence collected.
- ODS, backlog and capability register reconciled.
- Security, cost, performance and rollback reviewed.
- Product-facing work not marked Complete without Founder approval.
- Working tree clean; commit and push/deployment states reported separately.
- Founder Backlog Dashboard included as the final report section using the required five-column format.
