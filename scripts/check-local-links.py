#!/usr/bin/env python3
"""Check that relative links and assets in the static HTML site exist."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.paths.append(value)


errors = []
for page in sorted(ROOT.glob("*.html")):
    parser = Links()
    parser.feed(page.read_text(encoding="utf-8"))
    for value in parser.paths:
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path or url.path.startswith("/"):
            continue
        target = (page.parent / unquote(url.path)).resolve()
        if not target.exists():
            errors.append(f"{page.name}: missing {value}")

if errors:
    raise SystemExit("\n".join(errors))
print("Relative HTML links and assets exist.")
