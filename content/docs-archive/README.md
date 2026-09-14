# Archived documentation

This directory contains one snapshot per archived version. Version directory names must match `v<major>.<minor>.<patch>` or `v<major>.<minor>.x` and are served at `/<version>/docs`.

Archives contain English-only content and are created with `pnpm docs:archive <version>`. Archived content is frozen: it is never translated and is never modified by `pnpm sync:config-version`.
