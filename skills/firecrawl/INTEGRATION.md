# Firecrawl integration

Use for application code or configuration. Prefer direct REST for this custom deployment; the SDK path was not part of the live verification.

```bash
FIRECRAWL_API_URL=${FIRECRAWL_API_URL:-http://localhost:3002}
```

Direct REST requests worked without an API key. Keep the endpoint configurable and do not add hosted billing, account, credit, or webhook assumptions.

## Search

`POST /v2/search`

```json
{"query":"example query","sources":[{"type":"web"},{"type":"news"}],"limit":10}
```

Validate `success` and handle `.data.web`, `.data.news`, and `.data.images` separately. Image results are best-effort: validate relevance, source rights, and direct URL reachability.

## Page scraping and summaries

`POST /v2/scrape`

```json
{"url":"https://example.com","formats":["markdown"]}
```

REST responses wrap document fields under `.data`. Verified formats include Markdown, HTML, raw HTML, links, page images, summary, structured JSON extraction, screenshot, and branding.

Server-side `summary` output uses the private CLIProxyAPI and `gpt-5.6-luna` with no reasoning. Plain Markdown extraction does not require an LLM.

PDF/OCR support is not part of the current deployment and must not be advertised without a fresh end-to-end verification.

PNG screenshot works with `"formats":["screenshot"]`. JPEG also worked with:

```json
{"url":"https://example.com","formats":[{"type":"screenshot","fullPage":false,"quality":70}]}
```

## Page-image discovery and analysis

- `POST /v2/images/from-page` with `{"url":"https://example.com"}`
- `POST /v2/images/analyze` with `{"images":[{"url":"https://example.com/image.jpg"}]}`

Both were live-tested. Analyze rejects `imageUrl` and `imageUrls`; the required field is an `images` array of objects.

## Autonomous jobs

- `POST /v2/agent`
- `GET /v2/agent/:id`
- `DELETE /v2/agent/:id`

Unstructured jobs, status, events, and cancellation work. Autonomous structured schemas currently fail after the model call; do not expose that mode as supported. The live-tested aliases are `spark-1-mini` → `gpt-5.6-luna` (no reasoning) and `spark-1-pro` → `gpt-5.6-terra` (medium reasoning).

## Persistent interactions

- `POST /v2/interact` creates a session and returned HTTP 201.
- `GET /v2/interact` lists sessions.
- `GET /v2/interact/:id` returns status.
- `POST /v2/interact/:id/execute` runs a bounded batch.
- `DELETE /v2/interact/:id` deletes it.

The execute response places artifacts under `.actions`, including `screenshots`, `scrapes`, and `javascriptReturns`; it does not return a `.results` array.

Verified interaction semantics:

- JavaScript is an expression without top-level `return`.
- To write text, click/focus the input and then send `{ "type": "write", "text": "hello" }`.
- Key names are case-sensitive (`"Tab"` worked; `"TAB"` failed).
- Navigate, wait, click, write, press, scroll, screenshot, scrape, and JavaScript all worked.
- Use the returned `expiresAt`; do not assume a fixed lifetime.
- Session creation produced one transient HTTP 499 during shared browser activity, then succeeded on retry. Use bounded retry with backoff.

## Engineering requirements

- Bound connect, request, and poll timeouts.
- Validate HTTP status and endpoint-specific response shape.
- Preserve useful partial results.
- Model timeout, transient failure, terminal failure, cancellation, and expiry explicitly.
- Bound retries; never spin on HTTP 499, queue-full, or remote blocking.
- Never log prompts, cookies, credentials, headers, page bodies, or raw binary payloads.
- Test with the configured endpoint rather than assuming hosted Firecrawl behavior.
