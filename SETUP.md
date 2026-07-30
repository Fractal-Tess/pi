# Setup

Clone this repository into `~/.pi/agent`, then install its dependencies:

```sh
git clone https://github.com/Fractal-Tess/my-pi-setup.git ~/.pi/agent
cd ~/.pi/agent
npm install
```

## Theme

Add the included theme to `~/.pi/agent/settings.json` while keeping your existing settings:

```json
{
  "theme": "github-dark-default"
}
```

## Optional image generation

Install the Codex image-generation package:

```sh
pi install npm:pi-codex-image-gen@0.1.12
```

It uses Pi's existing `openai-codex` login and does not require an API key. If needed, run `/login` in Pi and select **ChatGPT Plus/Pro (Codex)**.

## `fd` and `rg` tools

The `file-search` extension uses a system-installed `fd` (or `fdfind` on Debian/Ubuntu) and `rg` when available. If neither is available, it downloads official release binaries for supported macOS and Linux systems into `~/.pi/agent/bin/`.

Restart Pi after setup, or run `/reload` from an active session.
