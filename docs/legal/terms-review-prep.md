# Terms & Conditions — preparation for legal review

Status: pre-review notes only. This is not legal advice or legal approval. A
lawyer should review the final terms against the contracting entity, sales
markets, order flow, and customer-facing policies before publication is treated
as approved.

Reviewed on 15 October 2026: `app/terms/page.tsx` and, on 16 October 2026,
the Privacy Policy at `app/privacy/page.tsx`.

## Questions for counsel

1. **Identify the contracting seller and applicable markets.** The page names
   Forever Shining but does not identify the legal entity, registration number,
   registered address, or a direct contact route. The site serves multiple
   market/domain variants, so confirm which entity contracts with customers in
   each market and whether one global terms page is appropriate. Decide whether
   governing law, venue, and dispute-resolution information should be included.
2. **Confirm when the contract is formed and which documents apply.** Section 1
   says an accepted quotation or order confirmation takes precedence over the
   website terms. Confirm that customers receive and can review the applicable
   documents before acceptance, and that the order confirmation does not
   silently change terms after payment or proof approval.
3. **Review the liability wording in section 9.** Assess the broad exclusion of
   indirect or consequential loss against each applicable consumer regime and
   the actual products/services sold. Confirm the adjacent savings language is
   clear enough and does not imply that statutory remedies are narrower than
   they are.
4. **Review cancellation and committed-cost wording in section 4.** Confirm how
   design, material, manufacturing, and shipping costs are evidenced and
   calculated for each order, and that the clause does not operate as a fixed
   penalty or restrict mandatory consumer remedies.
5. **Review the claims process in section 7.** Confirm that asking customers to
   contact the business promptly, provide photographs, and avoid installation
   or alteration is an evidence-gathering request rather than a condition that
   removes rights. Specify who pays for inspection, return, repair, or
   replacement where required by the applicable law.
6. **Check delivery and delay remedies.** Section 5 describes dates as estimates
   and lists possible causes of delay, but does not explain what happens if the
   seller cannot supply within the agreed or reasonable time. Align the terms,
   checkout, and order confirmation with actual delivery commitments and
   customer remedies.
7. **Check privacy and support contact details.** Section 10 points to contact
   details “displayed on this website or included” in order documents. Confirm
   the relevant contact details are prominent and consistent across each market
   and that the linked Privacy Policy matches the entity and data practices.
   The Privacy Policy draft now names Stainless Steel Monument Company Pty Ltd,
   describes account/design/order information, Stripe checkout, essential
   cookies, and Sentry diagnostics. Confirm that entity/domain relationship,
   contact details, service-provider disclosures, retention periods, and the
   explanation of IP-derived location match actual operations in every market.

## Observations from the current page

- The terms already say online prices are estimates, identify proof-checking
  responsibilities, distinguish illustrative previews from finished materials,
  and preserve rights that cannot lawfully be excluded.
- The remedies paragraph says repair, replacement, re-performance, or refund
  may be available “depending on the issue and applicable law.” Counsel should
  confirm this remains accurate and understandable in every served market.
- The page displays a last-updated date of 12 October 2026. Confirm that date
  matches the approved version and the version presented when an order is
  accepted.
- The site implementation currently renders one terms document for all
  visitors; no market-specific terms are selected in `app/terms/page.tsx`.

## Australian-law review prompts

The Privacy Policy is a draft based on the related Bronze Plaque site and does
not establish which entity contracts with each buyer or which law governs every
sale. If Australian Consumer Law applies, counsel should check at least these
points:

- Consumer guarantees cannot be excluded, restricted, or modified by contract;
  ensure the liability, product-variation, cancellation, and claims language is
  consistent with that rule.
- Businesses must not rely on terms that deny statutory remedies for products
  or services that fail consumer guarantees.
- Standard-form consumer and small-business terms are subject to the unfair
  contract term rules. Review the precedence, cancellation-cost, liability, and
  unilateral-update wording in the contract as a whole.
- Where a known issue may delay supply, customer-facing information should
  accurately explain availability, likely timing, and what happens if supply is
  late.

These are review prompts, not findings that any current clause is unlawful.

## Official references

- [Competition and Consumer Act 2010, Schedule 2 (Australian Consumer Law), including sections 23, 24, and 64](https://www.legislation.gov.au/C2004A00109/2026-03-28/2026-03-28/text/original/epub/OEBPS/document_4/document_4.html)
- [ACCC: Repair, replace, refund, cancel](https://www.accc.gov.au/business/problem-with-a-product-or-service-you-sold/repair-replace-refund-cancel)
- [ACCC: Supplying products or services that are paid for](https://www.accc.gov.au/business/selling-products-and-services/supplying-products-or-services-that-are-paid-for)
- [ACCC: Contracts and unfair contract terms](https://www.accc.gov.au/business/selling-products-and-services/contracts)

## Approval record

- Contracting entity/entities confirmed: pending
- Markets and governing law confirmed: pending
- Counsel reviewer and date: pending
- Approved terms version: pending
