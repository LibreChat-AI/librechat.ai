---
name: librechat-docs
description: Use the official LibreChat documentation to install, configure, operate, and troubleshoot LibreChat.
---

# LibreChat Documentation

Use LibreChat's official documentation as the source of truth for installation, configuration, features, administration, and troubleshooting.

## Documentation workflow

1. Fetch `https://www.librechat.ai/llms.txt` to find the most relevant documentation page.
2. Fetch a page as Markdown by appending `.md` to its canonical docs URL. For example, use `https://www.librechat.ai/docs/configuration/librechat_yaml.md` for the custom configuration reference.
3. Use `https://www.librechat.ai/llms-full.txt` only when the question spans multiple sections or the curated index is insufficient.
4. Cite the canonical HTML documentation URL in the final answer so the user can read the rendered page.
5. Check the changelog when behavior may differ between LibreChat releases.

## Accuracy and safety

- Do not invent configuration keys, environment variables, commands, defaults, or supported integrations.
- Preserve the exact spelling and casing of settings shown in the documentation.
- Distinguish settings in `.env`, `librechat.yaml`, Docker Compose overrides, and provider dashboards.
- Use placeholders for credentials and secrets. Never ask users to publish secret values.
- If the documentation does not answer the question, say so and direct the user to the LibreChat GitHub discussions or issue tracker.
