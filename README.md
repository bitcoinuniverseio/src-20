# SRC-20

**Documentation site: <https://bitcoinuniverseio.github.io/src-20/>**

SRC-20 is a fungible token protocol on Bitcoin. Its `DEPLOY`, `MINT` and `TRANSFER` operations are UTF-8 JSON documents carried in **transaction output scripts** through the Bitcoin Stamps data carrier. Output scripts are what a node needs in order to validate future spends, so every full node retains them, permanently, as part of the unspent output set.

This repository holds the documentation. It does not hold the protocol: SRC-20 originated in the Bitcoin Stamps community, and the rules documented here are the ones the Bitcoin Stamps indexer actually enforces.

## Pages

| Page | What is in it |
| --- | --- |
| [Overview](https://bitcoinuniverseio.github.io/src-20/) | Plain-language explanation, the unprunable-output argument, origin and history, the Stamps protocol family |
| [Specification](https://bitcoinuniverseio.github.io/src-20/specification.html) | Numbered normative rules: carriers, encoding, activation heights, ticker and numeric rules, operations, validity, invalidity |
| [Guide](https://bitcoinuniverseio.github.io/src-20/guide.html) | Worked examples with computed byte framing, costs, reading a result, product support matrix |
| [Reference](https://bitcoinuniverseio.github.io/src-20/reference.html) | Terminology, indexer semantics, limitations, security considerations, implementation checklist |
| [Test vectors](https://bitcoinuniverseio.github.io/src-20/vectors.html) | Valid, invalid and excluded vectors, plus a stateful token lifecycle |
| [Validator](https://bitcoinuniverseio.github.io/src-20/validator.html) | Client-side payload validator with the BRC-20 difference table |
| [Changelog](https://bitcoinuniverseio.github.io/src-20/changelog.html) | Document versions and protocol changes by block height |

## The protocol in one table

| | |
| --- | --- |
| Chain and network | Bitcoin mainnet only |
| Ownership model | Account ledger: balance per address, not per output |
| Operations | `DEPLOY`, `MINT`, `TRANSFER` |
| Protocol string | `src-20`, compared case-insensitively, hyphen required |
| Ticker | 1 to 5 Unicode code points, case-insensitive, restricted character set |
| Decimals | `dec` 0 to 18, **defaulting to 18** when omitted |
| Numeric ceiling | 18446744073709551615, that is 2^64 minus 1 |
| Sender | The address funding input 0 |
| Recipient | The address in output 0 |
| Carriers | Bare multisig with ARC4, and OLGA P2WSH from block 865000 |
| Live since | Block 788041 |
| Lifecycle | Stable |
| Document version | 2026.09.01 |

## Five things implementers get wrong

1. **Clamped mints are valid.** When `amt` exceeds the remaining supply or the per-mint limit, the amount is reduced and the mint still succeeds, with status `OMA` or `ODL`. Treating these as rejections under-counts circulating supply and is the most common cause of ledger divergence.
2. **`max` and `lim` truncate down; `amt` does not.** The asymmetry is real. `amt` keeps its fraction and is checked against `dec` instead.
3. **Numeric parsing was loose below block 833000.** Every character that was not a digit or a dot was stripped, so `"21,000,000"` was read as 21000000. Replaying history with today's strict rule produces different supplies.
4. **`BULK_XFER` is dead code.** It exists in the reference indexer but dispatch never reaches it, so such payloads are invalid with status `UO`. Do not implement it.
5. **OLGA takes precedence with no fallback.** When a transaction carries a qualifying P2WSH data output whose payload fails its checks, the multisig branch is deliberately not attempted. Adding a fallback forks the ledger.

A sixth, for readers rather than implementers: a **confirmed Bitcoin transaction is not a successful token operation**. Check the status in an explorer afterwards.

## On Counterparty

SRC-20 is widely described as being built on Counterparty. That was true from block 788041 and stopped being true at block **796000**, after which Counterparty-encoded SRC-20 is ignored outright. An indexer built today still needs Counterparty to replay history below that height and to index classic Bitcoin Stamps, but SRC-20 state from 796000 onward is derived from Bitcoin alone.

## Bitcoin Universe support

From the ecosystem capability registry, and nothing beyond it:

- **Core**: view, discover, view-collection, view-activity, view-transaction
- **Wallet**: view, send, receive
- **Inscribe**: deploy, mint, transfer
- **StampDEX**: view, discover, view-collection, view-activity, view-transaction, list, unlist, buy, cancel-offer, settle

Marketplace activity is **owned by StampDEX** in **external-execution** mode. `update-listing`, `make-offer`, `accept-offer`, `sell` and `reconcile` are not supported; the [guide](https://bitcoinuniverseio.github.io/src-20/guide.html#support) gives the recorded reason for each. Because SRC-20 is an account ledger, no output can be locked to back a listing, so there is no non-custodial escrow primitive.

## Grounding

Every normative statement is traceable to code:

- [`stampchain-io/btc_stamps`](https://github.com/stampchain-io/btc_stamps), the Bitcoin Stamps indexer, version 1.9.3. Constants quoted from `indexer/src/config.py`, `indexer/src/index_core/src20.py`, `indexer/src/index_core/transaction_utils.py`, `indexer/src/index_core/script.py` and `indexer/src/index_core/models.py`.
- [Stampchain](https://stampchain.io/), the public explorer and API.
- The Bitcoin Universe ecosystem capability registry, for product support claims.

## Building and contributing

Static hand-authored HTML, CSS and vanilla JavaScript. No build step, no dependencies, no CDN, no web fonts, no trackers. Serve the directory with any static file server:

```
python -m http.server 8000
```

`search-index.json` is generated from the pages' own headings. See [CONTRIBUTING.md](CONTRIBUTING.md) for the constraints that are deliberate, [SECURITY.md](SECURITY.md) for private vulnerability reporting, and [SUPPORT.md](SUPPORT.md) for where to ask questions.

## Elsewhere

- Central documentation portal: <https://docs.bitcoinuniverse.io>
- Report a vulnerability privately: <https://github.com/bitcoinuniverseio/src-20/security/advisories/new>

Brand asset attribution is in [`assets/ATTRIBUTION.md`](assets/ATTRIBUTION.md). Licensed under [MIT](LICENSE).
