# SRC-20 Conformance Vectors for Stamps, SRC-20 and SRC-101

Status: implementation test matrix. Last reviewed 2026-07-18.

These SRC-20 vectors are deliberately split between message validity, transaction construction, and indexed state. They are not substitutes for running the target indexer's own pinned test fixtures. Record the exact indexer version, block height, transaction ID, and observed result for every executed vector. SRC-101 integrations need their own operation-specific fixtures in the [SRC-101 documentation](https://bitcoinuniverse.github.io/src-101/).

## 1. Test setup

Use an isolated ticker for each run. All examples below use the placeholder <code>TST20</code>. Before each stateful vector, ensure the prior vector's observed indexed result matches expectations. Do not reuse a public production ticker.

Unless a vector says otherwise, use the portable JSON profile:

```json
{"p":"src-20","op":"deploy","tick":"TST20","max":"1000","lim":"100","dec":"0"}
```

The test transaction must place the intended source on <code>vin[0]</code> and the intended destination on <code>vout[0]</code>. For the Bitcoin Universe P2WSH profile, reconstruct the data output chunks and verify the frame is two-byte big-endian length, ASCII <code>stamp:</code>, then the displayed UTF-8 JSON.

## 2. Payload vectors

| ID | JSON intent | Expected structural result | Expected SRC-20 result |
| --- | --- | --- | --- |
| P-01 | Valid deploy with <code>max=1000</code>, <code>lim=100</code>, <code>dec=0</code> | Accepted Stamp payload | New ticker record accepted if unused. |
| P-02 | Same deploy but duplicate ticker | Accepted Stamp payload | State rejection, no replacement of deployed parameters. |
| P-03 | Deploy with missing <code>max</code> | Payload or operation rejection, target-dependent record handling | No token deployment. |
| P-04 | Deploy with <code>lim="1e2"</code> | Portable profile rejection | Do not depend on tolerant parser behavior. |
| P-05 | Deploy with <code>dec="19"</code> | Payload or operation rejection | No token deployment. |
| P-06 | Mint <code>{"p":"src-20","op":"mint","tick":"TST20","amt":"100"}</code> after P-01 | Accepted Stamp payload | Credit 100 to <code>vout[0]</code>. |
| P-07 | Mint <code>amt="101"</code> after P-01 | Accepted Stamp payload | Verify target behavior, expected credit is capped at 100 in the reference interpretation. |
| P-08 | Mint <code>amt="100"</code> after one or more separate setup mints fill the remaining supply | Accepted Stamp payload may remain indexed | Invalid SRC-20 transition, no new credit. |
| P-09 | Transfer <code>amt="25"</code> from an address with 100 indexed units | Accepted Stamp payload | Debit source and credit <code>vout[0]</code> by 25. |
| P-10 | Transfer <code>amt="101"</code> from an address with 100 indexed units | Accepted Stamp payload | Invalid SRC-20 transition, balances unchanged. |
| P-11 | Mint before the ticker has a successful deploy | Accepted Stamp payload may remain indexed | Invalid SRC-20 transition, no credit. |
| P-12 | Valid operation with JSON <code>to</code> contradicting <code>vout[0]</code> | Accepted Stamp payload | Credit follows <code>vout[0]</code>, not JSON <code>to</code>. |

The key assertion in P-10 and P-11 is two-layer reporting: an indexer can report Stamp-level success while reporting SRC-20-level failure. Never reduce these outcomes to one boolean in an integration UI.

## 3. Identity and ordering vectors

| ID | Construction change | Expected result |
| --- | --- | --- |
| T-01 | Intended source address is on <code>vin[0]</code>; desired recipient is on <code>vout[0]</code>. | Source and recipient attribution match intent. |
| T-02 | Swap the first two outputs while leaving JSON unchanged. | Indexed recipient follows the new <code>vout[0]</code>. Treat as an integration failure. |
| T-03 | Change which UTXO appears in <code>vin[0]</code>. | Creator or source attribution follows the new first input. Treat as an integration failure unless intended. |
| T-04 | Add JSON <code>from</code> and <code>to</code> values that disagree with transaction layout. | JSON claims do not override transaction-derived identity. |

## 4. Carrier vectors

| ID | Carrier condition | Expected result |
| --- | --- | --- |
| C-01 | Current P2WSH frame has correct length prefix, marker, and JSON bytes. | Target indexer decodes expected message. |
| C-02 | P2WSH frame length differs from actual payload length. | Structural rejection or no recognized payload. |
| C-03 | Correct P2WSH payload is passed through legacy ARC4 processing before verification. | Test fails because OLGA/P2WSH data must not use the legacy ARC4 transform. |
| C-04 | Historical bare-multisig/ARC4 carrier is tested at a historical height range. | Verify only with a target indexer that explicitly supports that era. Do not use as a current builder path. |

## 5. Bitcoin Universe product vectors

| ID | Product assertion | Expected result |
| --- | --- | --- |
| U-01 | Create a local deploy order. | Returned order is reviewable, has an expiration, and preserves intended output-zero ownership. |
| U-02 | Inspect a local P2WSH order. | Each data output uses the configured 330-sat value; data outputs follow <code>vout[0]</code>. |
| U-03 | Inspect service charge. | The configured 1,500-sat product charge is separate from miner fee and dust. |
| U-04 | Attempt broadcast after the one-hour order expiry. | Rebuild is required; stale order is not broadcast. |
| U-05 | Create a bulk mint count of 3. | Three independently verifiable mint transactions are created; no atomic all-or-nothing assumption. |
| U-06 | Try a bulk mint count outside 1 through 10. | Local request is rejected. |

## 6. Evidence template

For every vector, retain this record:

| Field | Value to capture |
| --- | --- |
| Vector ID | Example: <code>P-10</code> |
| Target indexer | Name, version, commit, and configuration if known |
| Bitcoin context | Network, block height, transaction ID, confirmation state |
| Exact payload | UTF-8 JSON and carrier reconstruction bytes |
| Transaction identity | First input prevout address and output-zero address |
| Stamp result | Accepted, rejected, or absent, with raw status if available |
| SRC-20 result | Applied, capped, or rejected, with balance delta |
| Local order data | Order ID, fee rate, signed transaction hash when using Universe |

Use failures to improve the integration rather than silently retrying with a changed transaction shape. A changed first input, first output, carrier, or indexer release can change the outcome.
