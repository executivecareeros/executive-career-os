# Domain Verification

## Purpose

This document records point-in-time registry and DNS observations for the final research candidates.

## Method

On **2026-07-12 at 12:00:21 UTC**, the exact domains were queried against the authoritative Verisign `.com` RDAP endpoint:

`https://rdap.verisign.com/com/v1/domain/{domain}`

An HTTP `404` with no domain record was treated as **apparently available**, not as a guarantee. A DNS lookup for `A`, `AAAA`, and `CNAME` records was also performed immediately afterward; none of the five returned a record. DNS non-resolution alone is not evidence of availability.

| Domain | Verisign RDAP | DNS response | Classification |
| --- | --- | --- | --- |
| `tavalen.com` | HTTP 404 | No A, AAAA, or CNAME | Apparently available |
| `narelon.com` | HTTP 404 | No A, AAAA, or CNAME | Apparently available |
| `ravalen.com` | HTTP 404 | No A, AAAA, or CNAME | Apparently available |
| `darelon.com` | HTTP 404 | No A, AAAA, or CNAME | Apparently available |
| `renalen.com` | HTTP 404 | No A, AAAA, or CNAME | Apparently available |

Earlier stages rejected many otherwise stronger names because Verisign returned an active domain record. Registrar checkout was intentionally not initiated because the board does not recommend any finalist. Normal registration price, premium status, and real-time availability therefore remain unconfirmed at checkout.

## Limitations

RDAP and DNS are point-in-time technical observations. They do not reserve a domain, prove freedom from prior use, exclude registrar-specific premium classification, or establish trademark rights. Domain status can change at any moment and must be reconfirmed during checkout.

