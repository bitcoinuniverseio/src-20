# Bitcoin Universe SRC-20 Transaction Profile for Stamps, SRC-20 and SRC-101

Status: product-specific integration profile. Last reviewed 2026-07-18.

## 1. Purpose and boundary

This document describes the SRC-20 construction and order behavior implemented by the Bitcoin Universe source tree at the review date. It is not a replacement for the upstream protocol specification, and it is not a claim that every Stamps indexer accepts every local behavior.

Use the public name **Stamps, SRC-20 and SRC-101** in product copy. Preserve <code>src-20</code>, <code>src20</code>, and <code>/src20</code> in technical interfaces. SRC-101 has a separate implementation and is documented in the [SRC-101 documentation](https://bitcoinuniverse.github.io/src-101/).

The local builder is an OLGA-style P2WSH profile. It MUST be kept distinct from the legacy direct-Bitcoin bare-multisig/keyburn and ARC4 profile described in historical material.

## 2. Local construction model

The builder takes an SRC-20 JSON object and constructs a Stamps payload frame. The current implementation follows this conceptual sequence:

1. Serialize the SRC-20 message as UTF-8 JSON.
2. Prefix the frame with a two-byte big-endian payload length and the ASCII marker <code>stamp:</code>.
3. Split the framed bytes into 32-byte chunks.
4. Commit those chunks through P2WSH data outputs.
5. Build a Bitcoin transaction whose first input and first output match the intended SRC-20 identity semantics.

For this P2WSH profile, do not ARC4-decrypt reconstructed payload data. ARC4 belongs to the historical bare-multisig path, not this local construction path.

## 3. Output layout and attribution

The current builder places outputs in this order:

| Order | Current role | SRC-20 significance |
| --- | --- | --- |
| <code>vout[0]</code> | Recipient dust output | Reference indexers derive the credited destination from this output. |
| Following outputs | P2WSH data outputs | Carry the framed Stamps payload in 32-byte chunks. |
| Optional following output | Bitcoin Universe service-fee output | Product charge, not an SRC-20 protocol rule. |
| Final output when present | Change | Ordinary Bitcoin change handling. |

Current local data outputs use 330 sats each. This is an implementation parameter, not a protocol-defined token fee or token value. A signer MUST review every output in the PSBT because output order and values are part of the final transaction semantics.

The reference interpretation derives the source or deploy creator from the address of the output spent by <code>vin[0]</code>. It derives the credited transfer or mint owner from <code>vout[0]</code>. Never substitute JSON address fields for this transaction-derived identity.

## 4. Product fees and Bitcoin fees

The source-tree configuration reviewed for this document sets a 1,500-sat Bitcoin Universe service fee per operation. It is separate from:

- the Bitcoin miner fee selected by fee rate and transaction weight;
- dust carried by the recipient and P2WSH data outputs; and
- the SRC-20 token amount encoded in the payload.

Configuration can change. The generated order and its PSBT are the final cost disclosure. Product UI and API clients SHOULD state all three categories separately and MUST not label the service fee as a Bitcoin consensus or SRC-20 protocol fee.

## 5. Supported local actions

Bitcoin Universe builds <code>deploy</code>, <code>mint</code>, and <code>transfer</code> orders through the <code>/src20</code> API surface.

| Action | Required local intent | Intended output-zero result |
| --- | --- | --- |
| Deploy | ticker, maximum supply, per-mint limit, decimal precision, sender | Sender dust only. Creator identity remains derived from <code>vin[0]</code>. |
| Mint | deployed ticker, amount, sender, recipient when supplied | Recipient, or the sender when the local flow defaults the recipient. |
| Transfer | deployed ticker, amount, sender, receiver | Receiver. |

The exact order request contract lives in [API reference](api-reference.md). Local preflight validation improves user feedback but does not replace target-indexer confirmation.

## 6. Local validation profile

The local service validates action, ticker, quantities, fee rate, and order parameters before it builds a PSBT. New clients SHOULD use the following conservative profile:

- Supply and mint limit: positive whole decimal strings at or below uint64 maximum.
- Decimal precision: integer from 0 through 18.
- Mint and transfer amount: positive plain decimal value within the token precision.
- Ticker: one through five characters. Prefer ASCII alphanumeric tickers unless the target indexer configuration has been tested for a wider character set.
- Optional metadata: keep descriptive fields bounded and treat them as nonessential indexer metadata.

Do not confuse a local validation result with an indexer result. The target indexer can reject or interpret a transaction differently because of its configured ticker allowlist, carrier support, current indexed state, or version.

## 7. Order lifecycle

1. Create an order with <code>POST /src20/order</code>.
2. Inspect the returned transaction or PSBT details before signing.
3. Sign with a wallet that preserves the selected inputs and output ordering.
4. Submit the signed result through <code>POST /src20/order/:orderId/broadcast</code>.
5. Check order status and the target indexer's post-confirmation SRC-20 outcome.

Local orders expire after one hour. An expired order MUST be rebuilt rather than signed or broadcast from stale assumptions. Fee rate, selected inputs, token state, and service configuration can all change between order creation and confirmation.

## 8. Bulk mint behavior

The local bulk-mint path supports one through ten independent mint transactions. It uses a funding fan-out and then creates independent mints rather than treating the set as one atomic SRC-20 action. Each operation can incur its own miner fee, dust, and product service fee. A partial broadcast or partial confirmation can therefore produce partial results.

Clients SHOULD show the exact count, aggregate estimated cost, and independent-result risk before users sign. After broadcast, verify each transaction separately by transaction ID and indexed balance change.

## 9. Integration acceptance checklist

Before exposing a release, test the implementation against a pinned target indexer:

1. Reconstruct the P2WSH payload and confirm the two-byte length, <code>stamp:</code> marker, and JSON bytes exactly match the intended message.
2. Confirm the intended source is the first consumed output's address.
3. Confirm the intended recipient is at <code>vout[0]</code>.
4. Confirm data outputs follow <code>vout[0]</code> and precede change.
5. Confirm all cost disclosures agree with the unsigned PSBT.
6. Confirm an expired order cannot be broadcast.
7. Confirm deploy, mint, transfer, over-limit mint, and insufficient-balance transfer outcomes using [Conformance vectors](conformance-vectors.md).

## 10. Security and support evidence

Never request private keys or recovery phrases. Never tell users to blind-sign a PSBT. For support and reproducibility, retain the order ID, exact JSON payload, fee rate, unsigned and signed transaction identifiers where appropriate, target indexer version, confirmation state, and indexed post-state. See [Security notes](security.md) for the full trust-boundary checklist.
