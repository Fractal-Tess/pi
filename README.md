<p align="center">
  <img src="assets/pi-logo.png" alt="Low-poly PI logo" width="280" />
</p>

# pi

An opinionated, batteries-included environment for the [Pi coding agent](https://pi.dev). It keeps Pi's extensible core while adding richer orchestration, long-running processes, research tools, interactive UI, and curated coding and design skills.

<p align="center">
  <img src="assets/pi-setup.jpeg" alt="Customized Pi terminal interface" width="760" />
</p>

## What It Adds

| Area            | Included capabilities                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Interface       | GitHub Dark Default theme, customized footer, model details, Git status, and activity indicators |
| File discovery  | Fast `fd` filename discovery and `rg` content search with bounded output                         |
| Interaction     | Structured single-choice, multi-select, confirmation, and free-text questions                    |
| Background work | Long-running terminals for servers, watchers, builds, and process dashboards                     |
| Delegation      | Isolated subagents powered by Pi, Claude Code, or Codex                                          |
| Workflows       | Phased multi-agent orchestration with parallel fan-out, structured results, and saved artifacts  |
| Sessions        | Automatic summaries, compact recaps, and improved context visibility                             |
| Images          | Optional Codex-backed image generation using Pi's existing OpenAI Codex login                    |

## Extensions

Extensions are TypeScript modules loaded automatically from `extensions/`. The main integrations are:

- **`ask-user`** — native interactive questions that tools and agents can await.
- **`background-terminals`** — starts and manages persistent processes without blocking the agent.
- **`file-search`** — adds purpose-built `fd` and `rg` tools with safe truncation.
- **`subagents`** — delegates isolated tasks to Pi, Claude Code, or Codex harnesses.
- **`workflows`** — coordinates several subagents through declared phases and concurrency limits.
- **`summaries`** — creates session summaries and compact handoff context.
- **`ui-customization`**, **`git-info`**, and **`model-info`** — enrich the terminal interface and footer.
- **`copy-all`** — copies complete assistant output for easier reuse.
- **`codex-image-gen`** — exposes optional image generation and editing as an agent tool.

## Skills

Skills are loaded progressively: Pi exposes their names and descriptions, then the agent reads the full instructions only when a task matches. The collection currently includes:

- **Browser and research:** Agent Browser and Firecrawl.
- **Frontend design:** Impeccable, Taste, GPT Taste, and React Bits Pro.
- **Svelte:** Svelte 5 code-writing tools and core best practices.
- **Engineering:** Apollo's Rust best-practices guide.
- **Operations:** Background-terminal and subagent usage guides.

Third-party skills may include scripts or powerful instructions. Review their source before use.

## Repository Structure

- `extensions/` — custom tools, terminal UI integrations, subagents, and workflows.
- `skills/` — Agent Skills packages and supporting references or scripts.
- `themes/` — the included GitHub-inspired Pi theme.
- `assets/` — README artwork and interface previews.
- `AGENTS.md` — global coding instructions loaded into Pi sessions.
- `SETUP.md` — installation, theme, image-generation, and search-tool setup.
- `package.json` — shared development dependencies and validation commands.

Runtime state such as sessions, credentials, private settings, downloaded binaries, generated images, and installed package caches is excluded through `.gitignore`.

## Quick Start

```sh
git clone https://github.com/Fractal-Tess/pi.git ~/.pi/agent
cd ~/.pi/agent
npm install
```

Configure the included theme, then restart Pi or run `/reload` from an active session. See [`SETUP.md`](SETUP.md) for the complete instructions and optional integrations.

## Development

Validate the TypeScript extensions and formatting:

```sh
npm run check
npm test
npm run format:check
```

Pi discovers global extensions and skills from this directory automatically. Most resource changes can be applied without restarting by running `/reload`.

## Security

Pi extensions execute with the current user's full permissions, and skills can direct the agent to run commands or bundled scripts. Install only trusted resources, inspect changes before activation, and keep credentials and runtime state out of version control.
