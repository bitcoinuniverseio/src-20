# Contributing

Thanks for helping keep the SRC-20 documentation accurate.

## The one rule that matters

Every normative statement on this site must be traceable to code that actually enforces it, or to an operator decision recorded in a repository. If you cannot point at the enforcing implementation, do not state the rule as protocol behaviour. Write what is verifiable and mark the rest as unverified or omit it.

Grounding sources used to build this site:

- `stampchain-io/btc_stamps`, the Bitcoin Stamps indexer, for protocol parsing and validity.
- `stampchain-io/stampchain.io`, the public explorer and v2 API, for the published field shapes.
- The Bitcoin Universe ecosystem capability registry, for what Bitcoin Universe products actually support.

## Working on the site

There is no build step and no package manager. Clone the repository and open the HTML files directly, or serve the directory with any static file server.

```
python -m http.server 8000
```

Constraints that are deliberate, please keep them:

- Static hand-authored HTML, CSS, and vanilla JavaScript. No framework, no bundler, no CDN, no web fonts, no trackers.
- All ordinary content must be readable with JavaScript disabled. JavaScript only enhances search, the theme toggle, and the validator.
- Light and dark themes must both meet WCAG 2.2 AA contrast.
- The layout must work down to 320px wide with no horizontal page overflow. Wide tables and code blocks scroll inside their own container.
- Diagrams are inline SVG with a `<title>` and `<desc>`, using CSS custom properties so they stay legible in both themes.
- No em dash characters anywhere.

## When you change page content

Update `search-index.json` so the new heading is findable, and add the page to `sitemap.xml` and `llms.txt` if it is new. If you change a normative rule, add a line to `changelog.html`.

## Pull requests

Branch from `main`, keep the change focused, and describe in the pull request which source you verified the change against. Documentation changes that assert protocol behaviour without a source will be asked for one.
