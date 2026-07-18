# Stamps, SRC-20 and SRC-101 Specification

Status: compatibility-oriented reference for new integrations. Last reviewed 2026-07-18.

## 1. Scope and authority

This document uses **Stamps, SRC-20 and SRC-101** as the public name. Stamps is the Bitcoin meta-protocol and asset ecosystem. SRC-20 is the fungible-token layer interpreted by Stamps indexers. SRC-101 is the distinct name and record layer. Not every Stamp is an SRC-20 token operation.

This specification remains the SRC-20 reference. Read the [SRC-101 documentation](https://bitcoinuniverse.github.io/src-101/) for its separate operation model and field rules.

SRC-20 is not enforced by Bitcoin consensus. Bitcoin nodes validate Bitcoin transactions. An indexer decides whether a supported carrier contains a Stamp, whether the payload is structurally valid, and whether it produces a valid SRC-20 state transition. For a production integration, pin the target indexer release and test against its fixtures.

When sources diverge, use this order:

1. The target release and tests of the maintained Bitcoin Stamps indexer.
2. The current protocol documentation for that indexer.
3. The Stamps SDK specification for legacy transport details.
4. This document, which intentionally recommends the narrowest portable builder profile.

Normative words such as MUST and SHOULD describe this documentation's portable profile. They do not override a target indexer's implementation.

## 2. Stable identifiers and terminology

Keep these compatibility-sensitive strings unchanged:

| Purpose | Identifier |
| --- | --- |
| Protocol literal | <code>src-20</code> |
| Operations | <code>deploy</code>, <code>mint</code>, <code>transfer</code> |
| Bitcoin Universe API route | <code>/src20</code> |
| Bitcoin Universe frontend tab ID | <code>src20</code> |

Do not present <code>cSRC-20</code> as a canonical standard. If a product needs the phrase, define it explicitly and narrowly as a local reference to legacy Counterparty-era SRC-20 records.

## 3. Era boundaries and carrier compatibility

The maintained indexer records successive compatibility boundaries, not one universal transport recipe.

| Boundary | Interpretation |
| --- | --- |
| Block 788,041 | First Counterparty-era SRC-20 record. |
| Block 793,068 | Direct-Bitcoin SRC-20 begins. |
| Block 796,000 | Counterparty SRC-20 is no longer honored after this cutoff. |
| Block 865,000 | OLGA / P2WSH SRC-20 begins. |

Historical direct-Bitcoin messages used a bare-multisig/keyburn path and ARC4 decryption. That is a historical parsing profile, not a new-builder recipe. The OLGA/P2WSH profile reconstructs the encoded payload from P2WSH chunks and does not apply legacy ARC4 decryption. See [Sources and version policy](sources.md) for the relevant upstream material.

## 4. Portable message profile

An SRC-20 message is a compact UTF-8 JSON object. New builders SHOULD emit lowercase <code>p</code> and <code>op</code>, quoted decimal values, and only fields they intend the target indexer to consume.

### 4.1 Canonical examples

Deploy:

```json
{"p":"src-20","op":"deploy","tick":"STAMP","max":"21000000","lim":"1000","dec":"0"}
```

Mint:

```json
{"p":"src-20","op":"mint","tick":"STAMP","amt":"1000"}
```

Transfer:

```json
{"p":"src-20","op":"transfer","tick":"STAMP","amt":"250"}
```

The code fences above are examples, not byte-for-byte framing instructions. Carrier construction is separate from JSON construction.

### 4.2 Field table

| Field | Applies to | Portable profile |
| --- | --- | --- |
| <code>p</code> | all | Required string, <code>src-20</code>. Target parsers may normalize case, but emit lowercase. |
| <code>op</code> | all | Required string: <code>deploy</code>, <code>mint</code>, or <code>transfer</code>. |
| <code>tick</code> | all | Required token identifier. Ticker identity is case-insensitive in the reference interpretation. Use one to five ASCII alphanumeric characters for broad compatibility. |
| <code>max</code> | deploy | Required positive, whole, plain decimal string. Do not exceed <code>18446744073709551615</code>. |
| <code>lim</code> | deploy | Required positive, whole, plain decimal string. Do not exceed <code>18446744073709551615</code>. |
| <code>dec</code> | deploy | Optional integer string from <code>0</code> through <code>18</code>. Omitted means <code>18</code> in the reference implementation. |
| <code>amt</code> | mint, transfer | Required positive, plain decimal string. It MUST not exceed the deployed precision and SHOULD stay within target-indexer numeric bounds. |

Use no exponent notation, thousands separators, signed values, or whitespace-dependent formatting. Do not rely on a tolerant parser accepting extra fields or coercing fractional <code>max</code> or <code>lim</code> values. Those historical behaviors are not a portable wire format.

### 4.3 Optional metadata and ignored address claims

Some current indexer implementations recognize optional descriptive metadata such as <code>desc</code>, <code>x</code>, <code>tg</code>, <code>web</code>, and <code>email</code>. Treat these as optional indexer metadata, not a universal protocol commitment. Do not rely on their existence, validation, rendering, or permanence across indexers.

Do not use JSON fields named <code>from</code> or <code>to</code> to authorize, route, or assign an SRC-20 operation. They are not the reference source-of-truth for ownership.

## 5. Transaction identity and ownership

For the reference interpretation:

- The source or creator is derived from the address of the previous output spent by <code>vin[0]</code>.
- The transfer destination or credited owner is derived from <code>vout[0]</code>.

Input and output ordering therefore materially affect the indexed result. A wallet integration MUST create the intended first input and first output before asking a user to sign. The JSON payload alone cannot correct a mismatched transaction layout.

## 6. SRC-20 state rules

### 6.1 Deploy

A deploy creates the ticker record if it does not already exist. A duplicate deploy is an invalid SRC-20 state transition. The deployed record sets the maximum supply, per-mint limit, and decimal precision.

### 6.2 Mint

A mint requires an existing deployment. In the reference behavior, an accepted mint credit is capped by the requested amount, the token's <code>lim</code>, and remaining supply. Requesting more than the per-mint limit or remaining supply should not be assumed to reject the record outright, because a target indexer may credit the capped amount. A mint after all supply is exhausted is invalid.

### 6.3 Transfer

A transfer requires an existing ticker and sufficient indexed source balance. An insufficient-balance transfer is invalid and leaves SRC-20 balances unchanged. SRC-20 accounting is address-indexed. It is not a Bitcoin-native UTXO token ledger.

## 7. Two-layer validation outcome

Keep structural Stamps validity separate from token-state validity.

| Layer | Question | Example failure |
| --- | --- | --- |
| Stamp structure | Does a supported carrier decode to an acceptable Stamp payload? | Malformed framing or malformed JSON. |
| SRC-20 state | Does the decoded message produce an allowed token transition? | Transfer exceeds indexed balance. |

A transaction can contain a structurally valid Stamp yet fail SRC-20 state validation. In that case, an indexer can retain the Stamp record while applying no token balance change. Applications MUST report these outcomes separately and MUST verify the post-confirmation result with their target indexer.

## 8. Conformance requirements for builders

Before release, an integration SHOULD prove all of the following against its target indexer version:

1. A deploy produces the intended ticker, supply, limit, precision, and creator identity.
2. A mint at, below, and above the limit has the expected credited amount and status.
3. A mint at the supply boundary has the expected capped or rejected result.
4. A transfer credits the address at <code>vout[0]</code>, not an address claimed in JSON.
5. An insufficient-balance transfer produces no balance mutation.
6. The supported carrier frame is decoded without applying the wrong era's transport transform.
7. The signed transaction preserves first-input and first-output ordering.

Use [Conformance vectors](conformance-vectors.md) as a starting test matrix. Preserve the exact JSON, transaction ID, target indexer version, and observed indexed outcome for every vector.

## 9. Non-goals and safety

This specification does not guarantee market value, ticker exclusivity across indexers, wallet compatibility, or permanence of third-party metadata. Never request a seed phrase or private key. Do not treat a broadcast transaction as an indexed or valid SRC-20 outcome until it has confirmed and been checked by the intended indexer.
