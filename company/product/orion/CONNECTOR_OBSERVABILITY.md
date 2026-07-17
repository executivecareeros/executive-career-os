# Connector Observability

Status: Permanent operational contract · Version: 1.0 · Owner: Opportunity Coverage Engine · Last reviewed: 2026-07-17

## Required connector evidence

Every certified connector uses the same evidence vocabulary:

| Concern | Source evidence |
|---|---|
| Status and health | Provider health probe and latest immutable run |
| Freshness | Successful run completion, inventory observation time, and manifest cadence |
| Discovery | Run counts and observed, changed, ignored, rejected records |
| Requests | Attempts, completion, failure, and measured duration |
| Retry and backoff | Queue attempts, retry state, retry time, and exhaustion |
| Replay | Explicit replay identity and immediately preceding run |
| Lifecycle | Deactivation dispositions and manifest lifecycle mode |
| Scheduler | Queue state, due backlog, completion, failure, cancellation, and duration |
| Certification | Common certification report and manifest validation |
| Versions | Manifest v1.0, SDK v1, and operations v1 |

## No-silent-failure rule

A failed run creates a failure event with its provider, run, time, code, retryability evidence, and deterministic failure class. A scheduled retry creates retry and backoff events. Unclassified errors remain `Unknown`; they are never discarded.

## Search and diagnosis

Operational failures can be searched by provider, failure class, and exact code. The chronological event stream preserves discovery, replay, scheduler, certification, and recovery context without exposing payloads, credentials, or personal data.

## Freshness rules

Freshness is measured against the cadence declared by the provider manifest. The platform records last successful discovery, replay, certification, inventory update, average successful refresh interval, oldest and newest opportunity observation, and cadence ratio. Missing evidence produces `Insufficient evidence`; “Remote,” provider metadata, or wall-clock assumptions never fill gaps.

## Privacy and security

Operational records contain counts, status, identifiers, timestamps, durations, and safe error codes. They do not contain provider credentials, response bodies, executive data, opportunity descriptions, or secret configuration.
