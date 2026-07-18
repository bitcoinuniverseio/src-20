# Stamps, SRC-20 and SRC-101 Sources and Version Policy

Status: source hierarchy for this documentation. Last reviewed 2026-07-18.

## 1. Authority order

SRC-20 is indexer-mediated. The source that decides a production outcome is the exact target indexer release, its configuration, and its tests. This documentation follows the hierarchy below.

1. [Maintained Bitcoin Stamps indexer](https://github.com/stampchain-io/btc_stamps), pinned to the release or commit used in production.
2. [Current SRC-20 protocol page](https://bitcoinstamps.xyz/en/protocols/src-20) and maintained indexer documentation.
3. [SRC-101 indexer implementation](https://github.com/stampchain-io/btc_stamps/blob/main/indexer/src/index_core/src101.py) for SRC-101 name and record behavior.
4. [Stamps SDK SRC-20 specification](https://github.com/stampchain-io/stamps_sdk/blob/main/docs/src20specs.md) for legacy carrier and compatibility context.
5. [OLGA specification](https://github.com/mikeinspace/stamps/blob/main/OLGA.md) for P2WSH framing context.
6. [Classic Bitcoin Stamps specification](https://github.com/mikeinspace/stamps/blob/main/BitcoinStamps.md) for ecosystem history.
7. [SIP and cross-indexer process](https://github.com/stampchain-io/btc_stamps/issues/686) for proposals and interoperability discussion.

For visual identity, use the unchanged [Stamps official press-kit assets](https://github.com/stampchain-io/stampchain.io/tree/dev/static/img/presskit) and the palette maintained with the official site. Brand assets do not determine protocol behavior.

Do not elevate a draft, social post, marketplace entry, explorer display, or past parser quirk above the target indexer's tested behavior.

## 2. Interpretation decisions in this document

| Topic | Documentation decision | Reason |
| --- | --- | --- |
| Public name | Use Stamps, SRC-20 and SRC-101. | Stamps is the umbrella asset ecosystem; SRC-20 is its fungible-token layer; SRC-101 is its name and record layer. |
| Block 796,000 | Describe it as the Counterparty cutoff. | The maintained indexer separately records direct-Bitcoin start at 793,068. |
| Transport | Scope bare-multisig/ARC4 to historical parsing; scope P2WSH to OLGA-era construction. | Carrier rules differ by era. |
| Ownership | Use <code>vin[0]</code> and <code>vout[0]</code>, not JSON address claims. | This matches the reference interpretation. |
| Ticker syntax | Recommend one to five ASCII alphanumeric characters for portable new builders. | Exact wider-character allowlists are target-indexer specific. |
| Parser permissiveness | Do not endorse extra fields or coercion of fractional supply values. | Tolerated behavior is not a stable interoperable contract. |
| Product rules | Label Bitcoin Universe fees, order expiry, and P2WSH builder behavior as local. | They are not universal SRC-20 rules. |

## 3. Local implementation sources

The product-specific documentation was reviewed against the following local implementation areas:

- <code>backend/src/src20/src20.service.ts</code>, transaction construction and order flow.
- <code>backend/src/src20/src20-validation.utils.ts</code>, local request validation.
- <code>backend/src/src20/src20.controller.ts</code>, REST route surface.
- <code>backend/src/src20/src20.service.ts</code>, request structures and order creation behavior.
- <code>backend/src/src20/src20-order.validation.ts</code>, local order-field validation.
- <code>backend/src/common/service-fee.ts</code>, current product service-fee configuration.
- [SRC-101 published documentation](https://bitcoinuniverse.github.io/src-101/) and its [independent source repository](https://github.com/bitcoinuniverse/src-101).

Local behavior is documented in [Universe transaction profile](universe-transaction-profile.md) and [API reference](api-reference.md). Any code change affecting output ordering, payload framing, fee configuration, order expiration, parameter types, or endpoint behavior MUST update those documents and the relevant conformance vector.

## 4. Review and update policy

Update this documentation when any of the following changes:

1. The target Stamps indexer release, parser, ticker allowlist, state rule, or carrier support changes.
2. A new protocol boundary or finalized SIP alters compatibility.
3. Bitcoin Universe changes its P2WSH construction, data-output value, output order, fee configuration, order expiry, bulk-mint range, or API contract.
4. An interoperability test reveals a discrepancy between these documents and the target indexer.

Each update SHOULD record the date, affected source release or commit, whether a user-visible behavior changed, and which conformance vectors were rerun. See [Documentation changelog](changelog.md).

## 5. How to resolve a conflict

When documentation and observed behavior conflict:

1. Preserve the raw transaction, payload bytes, indexer version, block height, and indexed result.
2. Reproduce on the pinned target indexer or its official test fixture.
3. Check whether the transaction uses a historical carrier era or current OLGA/P2WSH path.
4. Update local builder behavior only after confirming the target behavior.
5. Amend this document, the relevant specification text, and a conformance vector together.

Do not resolve an interoperability conflict by silently changing JSON or transaction ordering in production. That obscures the cause and can create unexpected token attribution.
