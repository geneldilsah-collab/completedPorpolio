"""Local dev server for the portfolio.

Same as `python3 -m http.server`, but tells the browser to revalidate every
file on each load. Without this, browsers cache ES modules heuristically and
can pair a fresh main.js with a stale module it imports — the import then
fails and the page never starts.

    python3 serve.py          # http://localhost:8000
    python3 serve.py 3000     # custom port
"""

import http.server
import sys
from functools import partial
from pathlib import Path


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(NoCacheHandler, directory=str(Path(__file__).resolve().parent))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Serving portfolio at http://localhost:{port}  (Ctrl+C to stop)")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
