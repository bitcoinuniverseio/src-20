# Bitcoin Universe SRC-20 API Reference for Stamps, SRC-20 and SRC-101

Status: product API reference. Last reviewed 2026-07-18.

All paths below are relative to a configured Bitcoin Universe API base URL. This API is a product integration surface, not a portable SRC-20 wire protocol. Keep the path prefix <code>/src20</code> unchanged even though the public product name is **Stamps, SRC-20 and SRC-101**. This document does not define an SRC-101 API contract.

## 1. Read endpoints

| Method and path | Purpose |
| --- | --- |
| <code>GET /src20/balance/:address/:ticker</code> | Look up one address and ticker balance. |
| <code>GET /src20/balance/:address?page=&amp;limit=</code> | List indexed balances for one address. |
| <code>GET /src20/lookup?ticker=</code> | Look up a ticker. |
| <code>GET /src20/tokens?ticker=&amp;start=&amp;limit=&amp;mintStatus=</code> | List index-backed token display rows. |
| <code>GET /src20/order/:orderId</code> | Retrieve an existing local order. |

### 1.1 Balance queries

The paginated balance endpoint defaults to <code>page=1</code> and <code>limit=50</code>. Page is clamped from 1 through 10,000 and limit from 1 through 100. Non-integer query values return a request error; out-of-range integers are clamped.

Balance data is index-backed. Upstream failures can return HTTP 200 with empty or null data and <code>last_block: 0</code>. Treat that response as degraded or indeterminate, not as proof that the address holds zero tokens.

### 1.2 Token list queries

The token endpoint defaults to <code>start=0</code> and <code>limit=20</code>. Start is clamped from 0 through 10,000,000 and limit from 1 through 100. Use an integer multiple of limit for start because the implementation maps start to <code>floor(start / limit) + 1</code>, not a true upstream row offset.

The returned <code>total</code> is estimated from upstream page count. A row's <code>id</code> is page-local display numbering, not a stable protocol identifier. Token values can be formatted or parsed for display. Do not use this endpoint as canonical accounting serialization.

When supplied, <code>mintStatus</code> recognizes <code>minting</code> or <code>minted</code>. Other values are treated as an unfiltered query. Use ticker deployment transaction and target-indexer context when presenting a token identity.

## 2. Create an order

<code>POST /src20/order</code> creates an unsigned order. It validates local request syntax and builds a PSBT. It does **not** prove that a ticker is deployed, that supply remains, that the requested precision matches an existing ticker, or that the sender has an indexed balance. Always check target-indexer state before and after broadcast.

### 2.1 Common request fields

| Field | Type and rules |
| --- | --- |
| <code>action</code> | Required nonempty string: <code>deploy</code>, <code>mint</code>, or <code>transfer</code>. |
| <code>tick</code> | Required nonempty string. The builder uppercases it. Use a one to five character ASCII alphanumeric ticker for broad compatibility. |
| <code>senderAddress</code> | Required nonempty string. Its selected funding input is important because <code>vin[0]</code> is identity-sensitive. |
| <code>feeRate</code> | Optional number or numeric string. Defaults to 5. Accepted range is 1 through 10,000, including fractional values. |

### 2.2 Deploy request fields

Deploy additionally requires:

| Field | Type and rules |
| --- | --- |
| <code>maxSupply</code> | Required positive digit-only string, at most <code>18446744073709551615</code>. |
| <code>limitMint</code> | Required positive digit-only string, at most <code>18446744073709551615</code>. |
| <code>decimals</code> | Optional string from <code>"0"</code> through <code>"18"</code>. Although some client types may show a number, the runtime requires a string. |
| <code>desc</code>, <code>x</code>, <code>tg</code>, <code>web</code>, <code>email</code> | Optional deploy-only strings. Each is trimmed and limited to 200 characters. Treat them as untrusted optional metadata. |

Example:

```json
{
  "action": "deploy",
  "tick": "TST20",
  "maxSupply": "21000000",
  "limitMint": "1000",
  "decimals": "0",
  "senderAddress": "bc1...",
  "feeRate": 5
}
```

### 2.3 Mint and transfer request fields

Mint and transfer require <code>amount</code> as a positive, finite JSON **number**, not a string. It must be no greater than <code>9007199254740991</code>. The builder serializes it to plain decimal notation with up to 18 decimal places.

This API constraint differs from the recommended portable protocol payload, which uses quoted decimal strings. Clients that use fractional quantities should avoid language-level floating-point drift and verify the exact JSON produced in the PSBT before signing.

| Field | Mint | Transfer |
| --- | --- | --- |
| <code>amount</code> | Required positive JSON number. | Required positive JSON number. |
| <code>receiverAddress</code> | Optional. Defaults to sender when absent. | Required nonempty string. |
| <code>repeatCount</code> | Optional integer 1 through 10. Defaults to 1. | Not supported. |

Example mint:

```json
{
  "action": "mint",
  "tick": "TST20",
  "amount": 100,
  "senderAddress": "bc1...",
  "receiverAddress": "bc1...",
  "repeatCount": 1,
  "feeRate": 5
}
```

Example transfer:

```json
{
  "action": "transfer",
  "tick": "TST20",
  "amount": 25,
  "senderAddress": "bc1...",
  "receiverAddress": "bc1...",
  "feeRate": 5
}
```

## 3. Create-order response and signing

A successful create response contains core order data, PSBT data, and create-time signing and cost information.

| Field group | Meaning |
| --- | --- |
| Core order fields | Order ID, action, ticker, lifecycle status, and expiration context. |
| <code>psbtBase64</code> and <code>psbtHex</code> | The unsigned PSBT. <code>psbtHex</code> is hex-serialized PSBT data, not a raw Bitcoin transaction. |
| <code>inputsToSign</code> | Create-time guidance for wallet signing. |
| <code>fee</code>, <code>dustTotal</code>, <code>numDataOutputs</code>, <code>serviceFeeAmount</code> | Create-time cost and construction details. |
| <code>psbts</code> | Returned at creation for every order. A single operation has one entry; for bulk mint, the funding PSBT is first, followed by one mint PSBT for each repeat. |

Use the create response as the authoritative review artifact. The later GET order response intentionally omits <code>inputsToSign</code>, all listed fee breakdowns, stored broadcast transaction IDs, and stored broadcast errors. Do not rely on frontend type declarations alone to infer GET response fields.

## 4. Broadcast an order

For a single order, submit:

```json
{ "signedPsbtHex": "..." }
```

to <code>POST /src20/order/:orderId/broadcast</code>.

For bulk mint, submit:

```json
{ "signedPsbtHexs": ["funding-psbt", "mint-psbt-1", "mint-psbt-2"] }
```

The signed PSBT or PSBTs must preserve the generated unsigned transaction exactly. Do not reorder inputs or outputs, add change, or replace P2WSH data outputs after order creation.

## 5. Order lifecycle and retries

The initial state is <code>pending_sign</code>. Observed later states include <code>expired</code>, <code>broadcast_failed</code>, <code>partially_broadcast</code>, and <code>confirmed</code>.

- Orders expire one hour after creation. A stale GET can still report <code>pending_sign</code> until a broadcast attempt marks it expired.
- In this API, <code>confirmed</code> means the broadcaster accepted the transaction. It does not mean Bitcoin block confirmation.
- A bulk mint can partially broadcast. The API can return HTTP 400 even after its funding transaction and some mint transactions were accepted.

Never blindly retry a bulk broadcast after an error. First determine which transactions entered the mempool, then rebuild only the work that remains valid. After Bitcoin confirmation, verify the target indexer's Stamp recognition and SRC-20 state result for each transaction.

## 6. Integration checklist

1. Read target-indexer token state before creating an order.
2. Create the order and preserve its exact response for review.
3. Verify first input, output zero, P2WSH outputs, change, miner fee, dust, and service fee.
4. Sign without mutating transaction structure.
5. Broadcast once and inspect lifecycle response.
6. Wait for the desired Bitcoin confirmation threshold.
7. Verify indexed Stamp status, SRC-20 state status, and balance delta.

See [Universe transaction profile](universe-transaction-profile.md), [Conformance vectors](conformance-vectors.md), and [Security notes](security.md) for construction and safety details.
