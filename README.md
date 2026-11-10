# Astral Gambit — Anime Chess

SvelteKit / TypeScript / chess.js / Stockfish 17.1 WASM single-worker prototype.

## Run

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run check
npm test
npm run build
```

Click or drag a piece. Settings changes side (starts a new game), sound and cinematics. Cutscene Lab uses the exact same Promise-based overlay as live matches. Saved PGN retains repetition history. Restart terminates the previous engine and invalidates pending moves.

Original SVG portraits live in `static/art`; character metadata and dialogue in `src/lib/game.ts`. These are stylized placeholder illustrations, ready to replace with production artwork. Current reactions use dialogue, lighting and pose rather than separately drawn facial expressions. Cutscene layers and timelines are in `src/lib/Cutscene.svelte`; sounds are synthesized locally.

Stockfish binaries are bundled locally in `static/engine` under GPLv3 (included LICENSE.txt). Corresponding source: https://github.com/nmrugg/stockfish.js/tree/v17.1.0 and the pinned npm stockfish package. No external image or audio services are required.

The environment is isolated: use this checkout; do not create an additional worktree unless explicitly requested. No backend or credentials needed.

## Public deployment

GitHub Pages workflow: `.github/workflows/pages.yml`. Enable Pages with source **GitHub Actions** in the repository settings. Pushes to `main` validate and deploy a static build with `BASE_PATH=/sip-chess`. No running Node server is needed in production. To build manually: `BASE_PATH=/sip-chess npm run build`; upload the `build` directory to static hosting under that path.
