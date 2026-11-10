# sip-chess

SvelteKit / TypeScript / chess.js / Stockfish 17.1 WASM.

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run check
npm test
BASE_PATH=/sip-chess npm run build
```

## Play

Main menu → Start → choose one of four characters, color and difficulty. Only single-player is available. The title screen uses an original illustrated sip-chess wordmark, with only the primary start action and optional resume. No character cutout is displayed there.
An opponent is randomly selected from the other three. Characters do not alter chess rules or AI strength.
Click or drag to move, choose promotion, undo or start a new game. PGN and character selection are restored from localStorage. Returning to the menu pauses AI; continue resumes the saved game. Restart/menu changes terminate the Worker and invalidate pending results.

Only checkmate uses a full-screen, skippable cinematic. Check, queen capture, en passant, promotion, castling and ordinary captures display character-specific dialogue and transparent illustrations in reserved side space. Normal play shows profile portraits above (opponent) and below (player) the board. Desktop side columns are reserved for event illustrations. Mobile reserves two reaction areas above the board. Checkmate uses a 3.86-second cancellable timeline: center slash, diagonal panels and face zoom, closed/open raster-eye transition, accelerating low rumble, impact freeze and shake, staggered localized typography, then a split-direction sweep exit. Portrait sizes remain bounded so faces and horns stay visible. The non-modal animation lab uses the exact same reactions and checkmate timeline.

## Languages

The language selector supports Korean and Japanese only. UI, errors, results, character names and dialogue all change immediately; the preference persists independently of the saved match. Translation keys live in `src/lib/i18n.ts`, and character dialogue lives in `src/lib/characters.ts`.

## Browser regression tests

With the dev server running, run `TEST_URL=http://127.0.0.1:5173 npm run test:browser`. Tests use system Chromium when available; otherwise install Chromium with `npx playwright install chromium`. `CHROMIUM_PATH` can select a browser binary. Screenshots are written outside the checkout to `/tmp/sip-chess-tests`. The tests cover the menu, random opponent, actual AI response, game restore, language persistence, en passant, queen capture, checkmate, stale AI cancellation, profile positions, full character containment at desktop/mobile sizes and reduced motion.

## Art and dialogue

`static/art/characters.png` is a real alpha-transparent raster sheet edited using the image-generation tool from the four unique user-supplied character references. No SVG character substitutes or external image URLs are used. The source generation is retained in the workspace's generated_images directory. CharacterArt uses CSS viewports into the raster sheet; portraits and full-body views share that image.

Names, personalities and event lines live in `src/lib/characters.ts`. `static/art/faces.png` contains four registered closed/open portrait pairs generated from the character references. `static/art/sip-chess-logo.png` is an original transparent raster logo, with ivory lettering, a lavender ribbon, knight and teacup matching the character artwork. SideReaction renders nonblocking character reactions; Cutscene handles checkmate only. `timeline.ts` owns cancellation of cinematic animations, phase timers and sound cues. Audio uses layered oscillators and filtered noise for swishes, low rumble, piece taps and impacts; mute/volume affect active sounds too.

The viewport layout keeps controls visible without document scrolling, including portrait and landscape phones. Move history has previous/next paging. Character selection uses a draft so cancelling it preserves the current match. `npm run test:viewport` checks eight viewport sizes (set `TEST_URL` for the running server).

`board-motion.ts` animates a paced 2.8-second board assembly and piece placement on a new match, plus real travel, capture removal, castling and promotion movement. It creates disposable DOM overlays only; chess.js remains the state authority. Menu navigation cancels overlays and restores any hidden destination pieces. Reduced motion bypasses travel/assembly and uses a short static finish. The uploaded video was used as motion reference, not embedded or redistributed.

## Deployment

`.github/workflows/pages.yml` validates and deploys main to GitHub Pages. Set repository Settings → Pages → Source to GitHub Actions. `BASE_PATH=/sip-chess npm run build` produces the static `build` directory; no production Node server or backend required.

Stockfish binaries in `static/engine` are GPLv3 (LICENSE.txt included). Corresponding source: https://github.com/nmrugg/stockfish.js/tree/v17.1.0 and the pinned npm stockfish package.

Use the existing isolated checkout. Do not create a Git worktree unless explicitly requested. No credentials are needed to run the game locally.
