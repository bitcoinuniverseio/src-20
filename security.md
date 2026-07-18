# Stamps, SRC-20 and SRC-101 Security Notes

Status: operational guidance. Last reviewed 2026-07-18. The SRC-20 transaction-layout guidance below must not be assumed to apply to SRC-101 without target-indexer evidence.

## 1. Core trust boundary

Bitcoin validates the transaction. A Stamps indexer interprets the carrier and SRC-20 state. A wallet decides whether to sign. These are distinct trust boundaries.

Do not describe an SRC-20 balance as Bitcoin consensus state. Treat it as a target-indexer result that must be independently checked after confirmation. Different indexer versions or configuration can differ at protocol edges.

## 2. PSBT review requirements

Never ask for a seed phrase, private key, or recovery phrase. Never instruct a user to blind-sign a PSBT.

Before signing, verify:

1. Every input belongs to the intended wallet and the first input has the intended SRC-20 source identity.
2. Output zero belongs to the intended recipient or credited owner.
3. P2WSH data outputs are present, ordered as expected, and carry the expected value.
4. Change output belongs to the signer and has not become an unintended recipient.
5. Miner fee is reasonable for the selected fee rate and transaction weight.
6. Any Bitcoin Universe service-fee output is separately disclosed and expected.
7. The exact JSON payload matches the action the user selected.

Output ordering is security-relevant for SRC-20. A wallet or middleware layer that reorders outputs can change the indexed recipient even if the JSON text is unchanged.

## 3. Address and identity safety

Do not authorize an action from JSON <code>from</code> or <code>to</code> fields. In the reference interpretation, source identity comes from the previous output consumed by <code>vin[0]</code>, and credited ownership comes from <code>vout[0]</code>.

An integration should display those two derived addresses in its confirmation screen. If either differs from user intent, stop and rebuild the transaction.

## 4. Fee and amount clarity

Keep four concepts separate:

| Concept | What it pays or represents |
| --- | --- |
| SRC-20 <code>amt</code> | Indexed token quantity, not bitcoin value. |
| P2WSH and recipient dust | Bitcoin outputs required by transaction construction. |
| Miner fee | Bitcoin network fee based on fee rate and weight. |
| Bitcoin Universe service fee | Product-specific charge, not a Bitcoin or SRC-20 consensus fee. |

Do not let an application round, localize, or silently convert user-entered quantities. Use plain decimal strings for payload construction and show the final signed transaction amounts in sats.

## 5. State and confirmation safety

Before a user spends money, preflight the target ticker and indexed source balance. After broadcast, do not mark an operation complete merely because the transaction entered the mempool.

Wait for the product's required confirmations, then verify both:

1. Stamp-level recognition of the carrier and payload.
2. SRC-20-level application of the intended state transition and balance delta.

An insufficient-balance transfer or mint for an undeployed ticker can still be a structurally valid Stamp. Its token result is not successful, and retrying it without a changed precondition creates more fees without fixing state.

## 6. Metadata and external links

Treat optional metadata such as descriptions, websites, social handles, and email addresses as untrusted display data. Never automatically execute, fetch, or treat it as proof of issuer identity. Use safe URL handling, user-visible destinations, and phishing checks.

Ticker text is not a unique identity guarantee across all products or indexers. Display the ticker with its deployment transaction, creator attribution, target indexer, and relevant network to reduce impersonation risk.

## 7. Historical and version risk

Do not apply the legacy bare-multisig/ARC4 parser to the current OLGA/P2WSH path. Do not apply the OLGA profile to an unsupported historical context. Pin the target indexer release and record its version with every integration test.

The Stamps ecosystem is experimental. Draft SIP proposals, ecosystem posts, and third-party explorers are not authorization to ship a new carrier or semantic rule. Require tested indexer support first.

## 8. Incident and support record

For every user-visible problem, retain the order ID when applicable, transaction ID, exact JSON payload, selected fee rate, first input prevout, output-zero address, output list, confirmation state, target indexer version, and observed Stamp and SRC-20 status. Redact wallet secrets and personal data before sharing any record.

This evidence makes it possible to distinguish a wallet-signing problem, transaction-layout problem, fee problem, carrier-recognition problem, and token-state problem without asking the user for sensitive material.
