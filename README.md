# SRC-20 documentation

Bitcoin Universe documentation for SRC-20 on Bitcoin.

## What this covers

SRC-20 uses JSON messages to deploy, mint, and transfer tokens within the Bitcoin Stamps ecosystem. Current SRC-20 behavior is direct on Bitcoin after activation, rather than relying on Counterparty.

## State model

The deployment and mint receiver are derived from vout 0. A transfer is authorized by the first input owner and routes the resulting balance to vout 0, so transaction construction is part of protocol validity.

## Documentation site

- Overview: [index.html](index.html)
- Field reference: [reference.html](reference.html)
- Build and verification playbook: [guide.html](guide.html)

## Core rules

- Tickers are compared case-insensitively and the first valid deployment wins.
- Ticker length is one to five permitted characters.
- max and lim are unsigned integer quantities, and dec is 0 through 18.
- Minting above remaining supply can be reduced to the remaining amount by indexer rules.
- A transfer above the holder balance is invalid, not partially settled.
- For valid operations, vout 0 has protocol meaning. Never reorder it casually.

## Source material

- [SRC-20 on Bitcoin](https://docs.openstamp.io/introduction/src20-protocol/src20-on-bitcoin)
- [Stampchain documentation](https://stampchain.io/docs)

## Scope

SRC-20 validity depends on the message and the transaction layout. Test both with the indexer version you will use in production.
