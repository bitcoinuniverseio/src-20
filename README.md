# Stamps, SRC-20 and SRC-101

Bitcoin Universe documentation for the Bitcoin Stamps ecosystem, its SRC-20 fungible-token layer, and its SRC-101 name and record layer.

The public documentation name is **Stamps, SRC-20 and SRC-101**. Compatibility-sensitive technical identifiers remain unchanged:

- SRC-20 protocol literal: <code>src-20</code>
- SRC-20 backend route: <code>/src20</code>
- SRC-20 frontend tab ID: <code>src20</code>
- SRC-101 protocol literal: <code>src-101</code>
- SRC-101 frontend tab ID: <code>src101</code>
- Combined documentation folder: <code>src-20-docs</code>
- Local nested SRC-101 documentation checkout, published independently: <code>src-101-docs</code>

## Read the docs

- [Overview](index.html)
- [Protocol reference](reference.html)
- [Build and verify guide](guide.html)
- [Bitcoin Universe transaction profile](universe.html)
- [Source hierarchy and maintenance policy](sources.html)
- [SRC-101 documentation](https://bitcoinuniverse.github.io/src-101/)

## Repository documents

- [Specification](specification.md)
- [Universe transaction profile](universe-transaction-profile.md)
- [API reference](api-reference.md)
- [Conformance vectors](conformance-vectors.md)
- [Security notes](security.md)
- [Sources and version policy](sources.md)
- [Documentation changelog](changelog.md)
- [SRC-101 repository](https://github.com/bitcoinuniverse/src-101)

## Scope

Stamps is the Bitcoin meta-protocol and asset ecosystem. SRC-20 is its fungible-token layer. SRC-101 is its name and record layer. A valid SRC-20 outcome depends on:

1. A Bitcoin transaction that confirms.
2. A supported Stamps carrier for the relevant protocol era.
3. A payload that passes structural validation.
4. An SRC-20 state transition accepted by the target indexer.

Bitcoin consensus does not natively enforce SRC-20 tickers, supply, mint limits, or address balances. Compatible indexers interpret those rules.

SRC-101 has a separate, strict operation model for deploy, mint, transfer, renew, and setrecord actions. Its [published documentation](https://bitcoinuniverse.github.io/src-101/) and source repository are maintained independently, while a local checkout remains nested at <code>src-101-docs</code> for combined authoring. Do not apply SRC-20 carrier, field, or balance rules to SRC-101 without target-indexer evidence.

## Protocol chronology

The maintained Bitcoin Stamps indexer records these distinct SRC-20 boundaries:

| Boundary | Meaning |
| --- | --- |
| Block 788,041 | First Counterparty-era SRC-20 token |
| Block 793,068 | Direct-Bitcoin SRC-20 begins |
| Block 796,000 | Counterparty SRC-20 is no longer honored after this cutoff |
| Block 865,000 | OLGA / P2WSH SRC-20 begins |

Do not describe 796,000 as the single direct-Bitcoin activation height. It is the Counterparty cutoff. Do not use the historical bare-multisig and ARC4 carrier as a universal current SRC-20 recipe.

## Core rules for new builders

- Use compact UTF-8 JSON with <code>p: "src-20"</code> and one of <code>deploy</code>, <code>mint</code>, or <code>transfer</code>.
- Use a one to five character ASCII alphanumeric tick for broad compatibility. The precise target indexer allowlist is authoritative for anything wider.
- Use quoted, plain decimal strings. Do not use exponent notation or separators.
- Use positive whole strings for <code>max</code> and <code>lim</code>, at or below uint64 maximum.
- Treat <code>dec</code> as optional 0 through 18, defaulting to 18 when omitted.
- Ensure <code>amt</code> respects the deployed decimal precision.
- Treat <code>vin[0]</code> as the source or creator and <code>vout[0]</code> as the destination or credited owner in the reference interpretation.
- Do not treat JSON <code>from</code> or <code>to</code> fields as authorization or routing.
- Verify the target indexer's result after confirmation. A valid Stamp payload can still be an invalid SRC-20 state transition.

## Universe profile

Bitcoin Universe currently builds an OLGA-style P2WSH payload path and applies product-specific order, fee, API, and validation rules. These are not universal SRC-20 rules. See [the Universe transaction profile](universe-transaction-profile.md) before integrating the local builder.

At the current source-tree configuration, the local builder has a 1,500-sat service fee per operation in addition to miner fees and transaction dust. The signed PSBT is always the final cost disclosure.

## Source policy

Use a pinned target indexer release as the production source of truth. This documentation is reviewed against:

- [Bitcoin Stamps maintained indexer](https://github.com/stampchain-io/btc_stamps)
- [Stamps SDK SRC-20 specification](https://github.com/stampchain-io/stamps_sdk/blob/main/docs/src20specs.md)
- [OpenStamp SRC-20 on Bitcoin](https://docs.openstamp.io/introduction/src20-protocol/src20-on-bitcoin)
- [OLGA specification](https://github.com/mikeinspace/stamps/blob/main/OLGA.md)
- [Bitcoin Stamps SRC-101 indexer implementation](https://github.com/stampchain-io/btc_stamps/blob/main/indexer/src/index_core/src101.py)
- [Stamps official press-kit assets](https://github.com/stampchain-io/stampchain.io/tree/dev/static/img/presskit)

See [sources.md](sources.md) for conflicts, interpretation decisions, and the documentation update policy.

## Status

Last reviewed: 2026-07-18.

The Stamps protocol is experimental. This guide provides technical compatibility information and is not financial, legal, custody, or security advice.
