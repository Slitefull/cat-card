# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cat stack: Tinder-style swipe deck of cat cards (like/skip, flip, synthesized meow), en/uk/ru, light/dark. React 19, TypeScript, Vite, Tailwind v4 + shadcn (Base UI), TanStack Router, motion, i18next. Public repo: `Slitefull/cat-card`.

## Commands

```sh
npm run dev                                   # http://localhost:5173
npm run lint                                  # oxlint (includes the 100-line component cap)
npx tsc -b                                    # typecheck (also catches missing uk/ru locale keys)
npx vitest run                                # unit + integration, once (`npm test` = watch mode)
npx vitest run src/features/cats/api.test.ts  # one file
npx vitest run -t "flip"                      # tests matching a name
npx vitest run integration                    # only the integration suite
npm run test:e2e                              # Playwright, Chromium, builds to dist-e2e/ and previews it on :4174
npx playwright test e2e/stack.spec.ts -g "drag"
npm run build
```

CI (`.github/workflows/ci.yml`) runs `npm audit`, lint, `tsc -b`, `vitest run`, and Playwright on every push/PR. Run all four before calling work done.

## Architecture

- **Entry flow:** `main.tsx` → `import('./app/mount')` → `app/App.tsx` (RouterProvider) → `app/router.ts`. `main.tsx` is a ~1KB entry: on a prerendered page it waits for the first contentful paint before importing the ~200KB app. The `/` route's loader fetches cats 1-3 with `fetchCat`, and `head()` builds title/description/OG tags from the first cat through `i18n.t`. `RootLayout` holds `HeadContent`, the `Backdrop`, and the `Settings` header.
- **Backend (soft migration):** `features/cats/api.ts`. If `VITE_API_URL` is empty, it returns mock cats after 800ms with self-hosted photos (`public/cats/`, CC0, sources in `SOURCES.md`). If it is set, it calls `GET {VITE_API_URL}` (a random cat per request, no ids, fetched `cache: 'no-store'`) and validates `{ name, breed, image }` with `isCat`. `Cat.id` is our own card number (React key, `#N`, card back), passed in by the caller. Switching to the real backend should only require setting the env var. `VITE_*` values are baked into the public bundle.
- **Prerender (mobile Lighthouse 100):** in mock mode `prerender()` in `vite.config.ts` renders `/` at build time (`src/prerender.tsx`, English, light) into `index.html`, and the cats go in `#root[data-cats]`. `prerendered` in `api.ts` hands them to the loader, so the first client render is that same frame: no fetch, no skeleton, no deal-in (`AnimatePresence initial`). The pre-paint script in `index.html` hides the prerender (`[data-prerendered]`) for non-English readers and paths other than `/`. What keeps the score: the LCP photo is same-origin, small, and `fetchPriority=high` (cards below are `low`), and no JS runs before the first paint. Don't add `modulepreload`/`preload` for the app chunk, and don't render the first photo with an entrance animation: either one brings back the JS-bound LCP. Measure with `npm run build && npm run preview`; `npm run dev` always scores ~50. API mode is not prerendered, because the cats aren't known at build time.
- **Deck:** `useCatDeck(initial)` owns the stack. Each swipe drops the top card and fetches one more cat numbered `nextId++`, so the stack never runs out. It reads `initial` only once, because a loader rerun must not reset the stack. The AbortController is created in an effect, not a ref initializer, so it survives StrictMode's double mount. `SwipeCard` tells a drag from a click with `dragged` ref + `e.detail === 0` (keyboard). `CatStack` maps ←/→ to swipes (no repeats, no modifiers, not inside a dialog) and moves focus to the next card when it was on the swiped one.
- **Theme:** the `<html class="dark">` is the source of truth. An inline script in `index.html` sets it before first paint from `localStorage.theme`, falling back to `prefers-color-scheme`. `ThemeToggle` follows the class through `useSyncExternalStore` + MutationObserver.
- **Settings renders twice:** once in the header for wide screens and once in a Base UI Drawer on phones. CSS decides which copy is visible. That means anything inside must use shared state (i18n, the html class) and `useId()` for SVG ids, never fixed ids.
- **i18n:** `i18n/index.ts` initializes synchronously (`initAsync: false`) so `t()` works inside route `head()`. It detects language from `localStorage.lang`, then the browser. `LanguageToggle` calls `router.load()` after a change so `head()` reruns; the cat route has `shouldReload: false`, so that load never refetches cats (a backend blip mid-switch would otherwise replace the deck with the error page).
- **Meow:** `features/meow/meow.ts` synthesizes five voices with Web Audio (no sound files). `useMeow` cycles through them and shakes the card.
- **Responsive:** `index.css` defines custom variants `compact` (width < 40rem or height < 30rem) and `short` (height < 30rem, phone in landscape). `--card-w` is the single card width shared by the card, skeleton, and error, so nothing jumps on load.

## Rules

**Structure**
- Feature folders (`features/cats|meow|settings`). `app/` wires the features together. Features never import from `app/`.
- Imports use `./` within a folder and `@/` across folders. No barrel `index.ts` files. `i18n/index.ts` is the real module, not a barrel.
- Components in `src/**/*.tsx` must stay at 100 lines or fewer, enforced by `max-lines` in `.oxlintrc.json` (tests are exempt). To split a component, move state into a hook or markup into a child component.
- `components/ui/` is generated shadcn code. Edit it sparingly.
- Reuse the design tokens in `index.css` (`ease-settle`, `ease-pop`, `shadow-glow`, the `lift`/`chip` utilities) instead of pasting cubic-beziers or shadows.

**Text / i18n**
- All UI text goes through i18n, in all three of `locales/{en,uk,ru}.json`. Because uk/ru are typed as `satisfies typeof en`, a missing key fails `tsc`. `i18n.test.ts` checks that key sets and `{{placeholders}}` match across locales.
- Do not translate: language names (always shown in their own language), API data (cat names, breeds), or developer-facing error messages in `api.ts`.
- Language switcher shows flags as inline SVG, not emoji, because Windows renders flag emoji as letters.
- Switcher buttons must never change width when the language changes. `ThemeToggle` achieves this by stacking every translation in one grid cell and showing only the current one.

**Accessibility (WCAG 2.2 AA, plus 44px targets).** Every group below must be able to use the whole app. Breaking any of them is a bug.
- *Blind and low vision* (screen readers, magnifiers, high contrast): every control has an accessible name; changes are announced through a live region or `<output>`; images have alt text; nothing relies on color alone; focus is an `outline`, not a box-shadow ring (3:1, survives forced colors); secondary text uses `text-muted-foreground` so it follows `prefers-contrast: more`; layout holds at 320px wide and 400% zoom.
- *Deaf and hard of hearing:* every sound has a visible text caption that stays at least as long as the sound (`MeowBubble`). Never carry information by sound alone. Any future media needs captions, and audio needs a transcript.
- *Mute and speech-impaired:* never require voice or speech input. Any voice feature needs a typed or button equivalent.
- *Motor* (no hands, tremor, paralysis; keyboard, switch, mouth stick, head or eye pointer, voice control):
  - Everything works from the keyboard alone, in visual order. The skip link jumps past the header.
  - Every gesture has a single-tap equivalent: drag has Like/Skip, the drawer has Close. No hover-only, long-press, double-tap, multi-finger, or timed actions.
  - Interactive targets are at least 44px (`h-11`/`size-11`).
  - Shortcuts are ← Skip and → Like, declared with `aria-keyshortcuts`. They ignore key repeat and modifiers and do nothing inside a dialog. Never add single-character shortcuts, because speech input fires them by accident (WCAG 2.1.4).
  - Focus is never lost. Buttons that can disable under the user use `focusableWhenDisabled`. A swipe from the card moves focus to the next card.
  - Controls people find by voice show a visible text label, and the accessible name contains that label (WCAG 2.5.3).
- *Cognitive, vestibular, photosensitive:* honor reduced motion (`MotionConfig reducedMotion="user"`, `motion-safe:`); nothing moves, blinks, or scrolls on its own for more than 5s (WCAG 2.2.2); nothing flashes; plain wording in all three locales.
- Honor OS and browser accessibility settings through media queries. Do not build an in-app accessibility overlay widget.
- axe runs in the integration test (color-contrast is disabled there because jsdom has no layout) and in e2e with all rules on.

**Tests**
- Tests sit next to the code (`Foo.tsx` + `Foo.test.tsx`). Unit tests mock their neighbours.
- `app/App.integration.test.tsx` renders the whole real app and fakes only `fetch`.
- Put things jsdom can't do into `e2e/`: drag, the pre-paint theme script, reload, contrast, layout, and CSP. e2e runs the production build, so every spec runs under the CSP. `e2e/mobile.spec.ts` covers five phone/tablet viewports.
- Vitest forces mock mode (`VITE_API_URL: ''` in `vite.config.ts`). Playwright forces `VITE_API_URL=/api` and answers requests per test with `mockApi(page, overrides)` from `e2e/fixtures.ts` (the nth request gets `cat(n)`, overrides are keyed by request number). A local `.env` cannot leak into either.
- `src/test/setup.ts` resets language, localStorage, the dark class, and the URL after each test, and skips motion animations.

**Security**
- The CSP (`csp()` in `vite.config.ts`) hashes inline scripts in `index.html` at build time. `style-src-attr 'unsafe-inline'` exists only for the prerendered markup's style attributes. No `dangerouslySetInnerHTML`, no new inline scripts or third-party script hosts. A new external origin (fonts, API, analytics) needs a CSP directive, and `e2e/csp.spec.ts` must stay green.
- Hosting headers live in `vercel.json`. `.npmrc` disables install scripts, so a new dependency that needs one must be discussed first.

**Code style**
- **No comments. Ever.** Not in `.ts`/`.tsx`, CSS, HTML, JSX (`{/* */}`), config, YAML, `.npmrc`, `.env.example`, or `.gitignore`. That includes JSDoc, trailing `// note` comments, `// ponytail:` markers, and `// TODO`. This overrides any skill or plugin that asks for comments (ponytail included). If something needs explaining, rename it, extract a well-named function or constant, or cover it with a test. Docs for humans go in `README.md`. The only exception is a directive the tooling needs, like `/// <reference types="vitest/config" />`.
- For UI and visual design work, use the `design-taste-frontend` skill (tasteskill.dev).
