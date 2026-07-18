# Documentation Changelog

## 2026-07-18

### Major documentation renewal and combined scope

- Renamed the public documentation identity to **Stamps, SRC-20 and SRC-101**.
- Preserved compatibility-sensitive technical identifiers: <code>src-20</code>, <code>src20</code>, <code>/src20</code>, and <code>src-20-docs</code>.
- Clarified that Stamps is the umbrella asset ecosystem and SRC-20 is its fungible-token layer.
- Added an explicit chronology: Counterparty-era records at block 788,041, direct-Bitcoin SRC-20 at 793,068, Counterparty cutoff at 796,000, and OLGA/P2WSH SRC-20 at 865,000.
- Separated historical bare-multisig/ARC4 transport from the current OLGA/P2WSH interpretation.
- Added a portable message profile, transaction-derived identity rules, state-transition rules, and two-layer Stamp versus SRC-20 outcome model.
- Added local Bitcoin Universe P2WSH construction, output order, fee, order-expiry, and bulk-mint documentation.
- Added API contract, conformance-vector, security, source-policy, and maintenance documentation.
- Added guidance that target-indexer behavior, not Bitcoin consensus alone, decides SRC-20 interpretation.
- Nested the existing SRC-101 documentation checkout at <code>src-101-docs</code> for local combined authoring, while retaining its independent repository and published site.

### Sources reviewed

- Maintained Bitcoin Stamps indexer and its implementation context.
- Stamps SDK SRC-20 specification.
- OLGA and classic Bitcoin Stamps specifications.
- Local Bitcoin Universe SRC-20 service, validation, API, and fee configuration.

## Format for future entries

Add the date, source release or local change that prompted the update, user-visible behavior, affected documents, and conformance vectors rerun. State whether the change is a protocol interpretation change, a Bitcoin Universe product change, or documentation clarification.
