# DKIM Key Generation Report

Purpose: Record the Microsoft-managed DKIM key generation result for `orendalis.com` before any production DNS migration.

## Generation status

Microsoft-managed DKIM keys were created for `orendalis.com` on July 12, 2026. The Microsoft Defender domain details now display both required CNAME records.

The DKIM list continued to show the cached status `NoDKIMKeys` immediately after creation. Microsoft states in the domain details that synchronizing DKIM keys can take several minutes. The generated selector values in the domain details are the authoritative confirmation that the keys exist.

## Selector1

- Host name: `selector1._domainkey`
- Points to address or value: `selector1-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft`

## Selector2

- Host name: `selector2._domainkey`
- Points to address or value: `selector2-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft`

## Signing status

DKIM signing remains disabled. Microsoft reports: `Bu etki alanı için DKIM imzası eklenmiyor.` No attempt was made to enable signing.

## Next required DNS actions

After separate founder approval:

1. Add a CNAME record for `selector1._domainkey` using the exact Selector1 destination above.
2. Add a CNAME record for `selector2._domainkey` using the exact Selector2 destination above.
3. Use a TTL of 3600 seconds unless the approved migration plan specifies otherwise.
4. Verify both CNAME records through public DNS.
5. Return to Microsoft Defender and confirm that Microsoft detects both selectors.
6. Enable DKIM signing only after a separate founder approval.

No MX, SPF, DMARC, Proton, website, wildcard, or ACME record should be changed as part of adding the DKIM selector CNAMEs.

## Rollback considerations

Creating Microsoft-managed DKIM keys does not change mail routing or activate signing, so no immediate rollback is required. If a future selector DNS change must be rolled back, remove only the two Microsoft selector CNAME records that were added during that approved change. Preserve the generated Microsoft keys for a later retry unless Microsoft support directs otherwise. Do not rotate or delete the keys during migration troubleshooting.

## Change boundary

- DNS records changed: No
- MX changed: No
- SPF changed: No
- DMARC changed: No
- Proton records removed: No
- DKIM signing enabled: No
