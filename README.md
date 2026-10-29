# paseo-antd-theme

Monorepo for the **Paseo Dark** / **Claude Light** themes for Ant Design v6.

| Path | What lives there |
| --- | --- |
| `packages/theme` | The published `paseo-antd-themes` package: themes, `PaseoThemeProvider`, Tailwind export, `DESIGN.md` / `MAPPING.md` |
| `packages/demo` | Vite demo that consumes the **built** package |
| `docs/` | Blog posts and palette material — repo-level content, not published |

## Commands

```bash
pnpm install
pnpm dev        # builds the theme package, then serves the demo on :5173
pnpm build      # theme + demo (topological order)
pnpm typecheck
pnpm test
pnpm verify:package   # npm pack + publint + attw, run from packages/theme
```

The demo imports `paseo-antd-themes` through its published entry points, so the
theme package must be built before the demo is typechecked or bundled — the root
scripts handle that ordering.
