# Archived documentation

This directory contains one snapshot per archived version. Version directory names must match `v<major>.<minor>[.<patch>|.x][-rc<n>]` — e.g. `v0.8.5`, `v0.8.8-rc2`, `v0.7.x` — and are served at `/<version>/docs`. A directory name outside that shape fails the build rather than silently publishing nothing.

Archives contain English-only content and are created with `pnpm docs:archive <version>`. Archived content is frozen: it is never translated and is never modified by `pnpm sync:config-version`.
