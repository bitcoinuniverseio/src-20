# Security policy

This repository publishes documentation for the SRC-20 fungible token protocol. It contains no runtime service, no key material, and no user data.

## Reporting a vulnerability

Report privately through GitHub: open the **Security** tab of `bitcoinuniverseio/src-20` and use **Report a vulnerability** (GitHub private vulnerability reporting). Do not open a public issue for a suspected vulnerability.

Useful reports for this repository include:

- a documented rule that does not match what the Bitcoin Stamps indexers actually enforce, in a way that could cause a reader to lose funds or mis-index state;
- a test vector whose stated outcome is wrong;
- a link, script, or asset in this site that behaves unexpectedly.

We aim to acknowledge a report within five working days.

## Scope

In scope: the content of this site, the payload validator, and the published static assets.

Out of scope: the Bitcoin Stamps indexers themselves, Counterparty, Stampchain, StampDEX, and any third-party wallet. Report those to their own maintainers. Vulnerabilities in Bitcoin Universe products belong in the security policy of the product repository.

## No secrets here

The site is fully static: hand-authored HTML, CSS, and vanilla JavaScript, with no build step, no analytics, no third-party requests, and no server component. The payload validator runs entirely in your browser and never transmits or stores what you paste into it.
