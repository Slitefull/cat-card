# Cat stack

Swipe through cat cards: like, skip, flip for the back, meow for a synthesized voice. English, Ukrainian, Russian; light and dark.

React 19 · TypeScript · Vite · Tailwind v4 + shadcn (Base UI) · TanStack Router · motion · i18next.

## Run

```sh
npm install
npm run dev          # http://localhost:5173
```

The API is optional. Copy `.env.example` to `.env` and set `VITE_API_URL` to use a real backend
(`GET {VITE_API_URL} -> { name, breed, image }`, a random cat per request). Left empty, `src/features/cats/api.ts` serves mock cats.
`VITE_*` values are baked into the public bundle, so never put secrets there; a change needs a rebuild (on Vercel, a redeploy).

`VITE_API_URL` is either an absolute `https://` URL (the backend must send `Access-Control-Allow-Origin` for this site and its preview URLs) or `/api` behind a proxy (a `vercel.json` rewrite placed before the SPA catch-all, plus `server.proxy` in `vite.config.ts` for dev). The build rejects anything else, except plain `http://` on localhost.

The backend contract:

- `GET {VITE_API_URL}` returns `200 { name, breed, image }`, a new random cat on every request. No ids: the app numbers the cards itself and ignores other fields.
- The app fetches with `cache: 'no-store'`, so a CDN in front of the API must not cache it either.
- `image` is an absolute `https` URL. A relative one resolves against this site, not the API.

| Script | What |
|---|---|
| `npm run lint` | oxlint, includes the 100-line cap on components |
| `npx tsc -b` | typecheck |
| `npm test` | Vitest unit + integration (jsdom) |
| `npm run test:e2e` | Playwright against the production build (CSP on), API mocked per test |
| `npm run build` | production build to `dist/` |

CI (`.github/workflows/ci.yml`) runs all of the above plus `npm audit` on every push and PR.

## Accessibility

Built to WCAG 2.2 AA for people who are blind or have low vision, deaf or hard of hearing, mute, have motor disabilities (keyboard, switch, head or eye pointer, voice control), or have cognitive or vestibular disabilities.

- **Keyboard:** the first Tab shows "Jump to the cats", which skips the settings. `←` skips and `→` likes from anywhere on the page. Enter or Space on the card flips it. Focus stays put when a card leaves or the buttons disable.
- **Voice control:** Skip and Like have visible labels, so "click Like" works.
- **Sound:** every meow shows a text bubble for at least as long as it plays. Nothing needs sound or speech.
- **Motion:** nothing moves on its own. Card animations follow the OS reduce-motion setting. The app also follows the OS contrast and forced-colors (high contrast) settings.

## Security

- **CSP** as a `<meta>` in the built `index.html` (`csp()` in `vite.config.ts`): scripts only from the site plus the hash of the inline theme script, fetch only to the site and `VITE_API_URL`'s origin. `e2e/csp.spec.ts` checks nothing gets blocked.
- **Headers** in `vercel.json`: no framing, `nosniff`, referrer and permissions policy. Vercel adds HSTS itself.
- **Supply chain:** `.npmrc` turns off install scripts and skips versions under 7 days old. Dependabot (`.github/dependabot.yml`) bumps npm packages and the SHA-pinned CI actions weekly.
- **CI** runs with a read-only token.

## Structure

```
src/
├── main.tsx            entry
├── index.css           Tailwind theme, design tokens (ease-settle, ease-pop, shadow-glow), lift/chip utilities
├── app/                shell: App, router, RootLayout, CatPage, NotFound, Backdrop
├── features/
│   ├── cats/           api + Cat type, CatStack, SwipeCard, CatCard, useCatDeck, useHoverTilt
│   ├── meow/           Web Audio meow synth, useMeow, MeowBubble, MeowButton
│   └── settings/       Settings drawer, LanguageToggle, ThemeToggle
├── components/ui/      shadcn primitives (generated, edited sparingly)
├── i18n/               i18next setup + locales/{en,uk,ru}.json
├── lib/                shared helpers (cn)
└── test/setup.ts       Vitest setup
e2e/                    Playwright specs + fixtures
```

Conventions:

- **Feature folders.** Code that changes together lives together. `app/` wires features up; features don't import `app/`.
- **Tests sit next to the code** (`Foo.tsx` + `Foo.test.tsx`). `e2e/` covers the real browser: layout, drag, a11y with color contrast.
- **Components stay under 100 lines**, enforced by `max-lines` in `.oxlintrc.json`. Split by extracting a hook (state) or a child component (markup).
- **Imports:** `./` inside a folder, `@/` across folders. No barrel `index.ts` files.
- **No comments** in code or config. Names and tests carry the intent.
