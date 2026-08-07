# Autonomous Firecrawl jobs

Use when the model must choose among search, scrape, and discovery steps. Prefer explicit commands when the workflow is known.

## Verified unstructured workflow

```bash
firecrawl agent "Return the page title and purpose. Cite the source URL." \
  --urls "https://example.com" --model spark-1-mini --wait --timeout 300 --json
```

The aliases were live-tested after deployment:

- `spark-1-mini` resolves to `gpt-5.6-luna` with no reasoning;
- `spark-1-pro` resolves to `gpt-5.6-terra` with medium reasoning.

Both completed successfully. Use the mini alias unless the task benefits from additional reasoning.

For asynchronous creation, the job ID is nested under `.data.jobId`:

```bash
created=$(firecrawl agent "Research this topic" --model spark-1-mini --json)
job_id=$(jq -r '.data.jobId' <<<"$created")
firecrawl agent "$job_id" --status --json
firecrawl agent "$job_id" --cancel --json
```

Creation, polling, completion, and cancellation were live-tested. Copy the real UUID; never execute a literal placeholder.

## Structured output is currently broken

Do **not** use autonomous-agent `--schema` on this deployment. A valid simple object schema reached the model and then failed server-side with:

```text
Invalid response from "wrapModelCall" in middleware "patchToolCallsMiddleware"
```

Unsupported `$ref` schemas were also rejected. Use one of these instead:

- deterministic page extraction with `firecrawl scrape --format json --schema ...`;
- an unstructured agent result followed by local validation and normalization.

Never claim autonomous structured output succeeded unless a fresh end-to-end test proves it.

## Lifecycle and traces

Observed status output includes:

- `status`, `id`, `data` or `error`;
- `localModel`;
- `createdAt`, `updatedAt`, and `expiresAt` in REST status;
- ordered `lifecycle`, `tool.start`, and `tool.finish` events.

A completed test job had 14 events and an expiry about 24 hours after creation. Capacity and queue-size values were not load-tested, so do not hard-code them; handle queue-full, timeout, cancellation, and transient service errors explicitly.

Seed URLs guide the job but should not be treated as strict navigation confinement. Prompts and results persist until expiry, so never include secrets.
