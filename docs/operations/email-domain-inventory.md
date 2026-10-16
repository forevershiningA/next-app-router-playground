# Customer-facing email domain inventory

Reviewed on 16 October 2026. This is a code inventory and public DNS spot-check,
not a verification that any mailbox is owned, monitored, or authorized for
application mail.

## Configured regional email identities

| Region key | Customer reply address (`config.email`) | BCC routing in `countries.ts` | Notes |
| --- | --- | --- | --- |
| `au` | `admin@forevershining.com.au` | Saved designs, orders, and admin use `@forevershining.com.au`; `always` uses `polcreation@gmail.com` | `countries24.json` identifies The Stainless Steel Monument Company Pty Ltd. |
| `us` | `admin@bronze-plaque.com` | Saved designs use `saveddesignsus@bronze-plaque.com`; orders/admin use `admin@bronze-plaque.com`; `always` uses `polcreation@gmail.com` | Country data identifies a Canadian business address for this profile. |
| `ca` | `admin@bronze-plaque.com` | Same as `us` | Shared North American identity. |
| `pl` | `biuro@wiecznapamiec.pl` | All customer categories use `biuro@wiecznapamiec.pl`; `always` uses `polcreation@gmail.com` | Country data identifies Wieczna Pamięć Robert Szymański Sp.K. |
| `uk`, `eu` | `forevershining@optusnet.com.au` | All customer categories use `biuro@wiecznapamiec.pl`; `always` uses `polcreation@gmail.com` | Reply identity and BCC identity do not match. |
| fallback | `admin@forevershining.com.au` | Saved designs, orders, and admin use `@forevershining.com.au`; `always` uses `polcreation@gmail.com` | Used when no region-specific email config is found. |

## Other addresses found in application code

- Public footer and memorial pages link to `admin@bronze-plaque.com` and
  `admin@forevershining.com.au`.
- Login and account support links now use `admin@forevershining.com.au` (updated 16 October 2026 at the business's direction).
- Supplier mail falls back to `admin@forevershining.com.au`; it can instead use
  `SMTP_FROM` or `SMTP_USER`.
- Transactional email `From` may be overridden by `SMTP_<REGION>_FROM`, then
  `SMTP_FROM`, then the regional SMTP user, then the regional reply address.
  Customer replies use the region's configured `config.email`.
- Several admin screens contain additional individual `@forevershining.com.au`
  addresses. Those are operator/contact records, not necessarily public sender
  identities.

## Verification needed before changing any address

For each proposed sender/reply mailbox, the business or mailbox administrator
needs to confirm:

1. The mailbox or alias exists, receives mail, and has an owner responsible for
   customer replies.
2. The chosen SMTP account is authorized to send using the proposed `From`
   address, and the exact `SMTP_*_FROM`/`SMTP_FROM` deployment values match.
3. SPF, DKIM, and DMARC are configured for the sending provider and the domain.
4. Regional legal entities, languages, customer-support routing, and reply
   ownership remain correct after any consolidation.
5. The `polcreation@gmail.com` BCC recipient is still required and approved for
   every region and message type.

No code addresses have been changed because mailbox and sender verification is
an explicit precondition in the backlog.

## Public DNS spot-check (16 October 2026)

The records below were queried from the current public DNS view. DNS answers can
change, and they do not prove that a mailbox is active or that the application
can authenticate and send through the provider.

| Domain | Public DNS observation | Follow-up |
| --- | --- | --- |
| `forevershining.com.au` | MX points to Microsoft 365; SPF is `include:secureserver.net -all`; DMARC is present with `p=quarantine` and a GoDaddy reporting address. | Confirm which system actually sends application mail. The SPF provider does not match the MX provider. Check the live SMTP settings and DKIM signing before changing SPF. |
| `bronze-plaque.com` | MX points to Microsoft 365; SPF is `include:secureserver.net -all`; no DMARC policy record was returned. The common Microsoft `selector1`/`selector2` DKIM names did not resolve. | Confirm the authorized sending provider, publish/verify DMARC, and ask the Microsoft 365 administrator for the configured DKIM selectors and signing state. |
| `wiecznapamiec.pl` | MX points to the domain itself; SPF includes the listed IPv4 host, `a`, `mx`, and Google, ending in `~all`. `_dmarc` aliases to the apex, which has no DMARC policy. The checked `google` and `default` DKIM names alias to the apex rather than exposing a key. | Confirm the mail host, actual sending services, DMARC policy, and correct DKIM selector records with the domain/mail administrator. |
| `optusnet.com.au` | MX points to Atmail; DMARC is present with `p=reject`. | Confirm that `forevershining@optusnet.com.au` is still a monitored mailbox and that the configured SMTP sender is authorized by this provider. |
| `forevershining.com` | No MX record was returned. A/AAAA records point to Brandsly domain-for-sale hosts. | The former `support@forevershining.com` links have been replaced with `admin@forevershining.com.au` at the business's direction. Verify the new mailbox is monitored and authorized for customer support. |

The checks above only tested common DKIM selectors, not every selector a mail
provider could use. No production SMTP send or mailbox receipt test was
performed.
