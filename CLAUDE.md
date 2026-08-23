# Coffee Recipe

A guided brewing companion for the Hario Switch: pick a recipe, and a timer
walks you through every pour, pause, and switch toggle in real time.

Modelled on the structure of the RoastAroma Hario Switch brewing tool
(chooser → prep screen → guided timer). All copy here is original; the brewing
parameters are the published recipes of the brewers credited on each card.

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript, React 19.
- **Styling**: Tailwind CSS v4, CSS-first config via `@theme inline` in
  `globals.css`. No component library.
- **Package manager**: npm. **Node**: 24.x.
- Fully static — both recipe routes are prerendered via `generateStaticParams`.
  There is no server-side work, no database, and no persisted state.

## Design system

Carried over from the owner's mediakit project so the two sites read as a set.
Tokens live at the top of `src/app/globals.css`.

| Token          | Value     | Purpose                             |
|----------------|-----------|-------------------------------------|
| `--paper`      | `#fff1e5` | Salmon page background              |
| `--paper-soft` | `#fceadb` | Card hover / highlight panels       |
| `--ink`        | `#14110f` | Headlines and body                  |
| `--ink-soft`   | `#4a4540` | Meta and secondary text             |
| `--rule`       | `#e6d3bf` | Hairline rules (used instead of shadows) |
| `--accent`     | `#990f3d` | Deep red — kickers, live pour target, cautions |
| `--link`/`--steep` | `#0d7680` | Teal — "switch open" state      |

Type: Georgia serif for headlines and body copy (`.headline`, `.summary`),
system sans for UI chrome (`.kicker`, `.meta`). `.tnum` forces tabular numerals
so the clock and pour targets don't jitter as digits change.

### Dark mode

Same tokens, re-pointed. Dark keeps the warmth — a roasted near-black rather
than a neutral slate — so it still reads as the same publication.

| Token          | Dark      | Note                                    |
|----------------|-----------|-----------------------------------------|
| `--paper`      | `#17130f` | Warm near-black                         |
| `--paper-soft` | `#201a15` | Raised panels                           |
| `--paper-deep` | `#2b231c` | Dial track                              |
| `--ink`        | `#f5ece1` | Warm off-white                          |
| `--ink-soft`   | `#b3a596` | Meta text                               |
| `--rule`       | `#382e25` | Hairlines                               |
| `--accent`     | `#f2698d` | Lifted rose — `#990f3d` fails on dark   |
| `--link`/`--steep` | `#5cbdb6` | Lifted teal — `#0d7680` fails on dark |

Because every component reads the tokens, nothing else needed touching — the
brew dial's SVG strokes re-theme from here too.

Dark is applied **two ways, and both are required**:

- `:root[data-theme="dark"]` — an explicit choice made with the toggle.
- `@media (prefers-color-scheme: dark)` scoped to
  `:root:not([data-theme="light"])` — visitors who never chose and follow
  their OS. The `:not()` guard is what lets an explicit *light* choice beat a
  dark OS setting.

`THEME_INIT_SCRIPT` in `src/lib/theme.ts` is inlined into `<head>` and runs
before first paint, restoring a saved choice onto `<html>`. Without it a
dark-mode visitor gets a salmon flash on every navigation. `<html>` carries
`suppressHydrationWarning` because that script mutates it before React
hydrates.

`ThemeToggle` is deliberately **stateless**: it renders both icons every time
and lets CSS choose which shows (`.theme-icon--*`). Server and client markup
stay byte-identical, so there is no hydration mismatch and no need to read
localStorage during render. Don't "improve" it into a `useState` +
`useEffect` component — that reintroduces both problems, and trips
`react-hooks/set-state-in-effect`.

## Files

```
src/
├── app/
│   ├── globals.css          # tokens + typography/control utilities
│   ├── layout.tsx           # shell + metadata
│   ├── page.tsx             # recipe chooser
│   └── brew/[id]/page.tsx   # resolves a recipe, renders BrewFlow
├── components/
│   ├── BrewFlow.tsx         # prep → brewing → done, all three screens
│   ├── useBrewTimer.ts      # the clock
│   ├── Masthead.tsx
│   └── SiteFooter.tsx
└── lib/recipes.ts           # recipe data + step lookup helpers
```

### `src/lib/recipes.ts`

The whole recipe model. A `Recipe` carries its dose/water/temp/grind, total
length, starting switch position, a prep checklist, and an ordered `steps` list.

Each `Step` is anchored at an absolute `at` (seconds from brew start) rather
than a duration, so the timeline can never drift out of sync with the clock.
A step has two display phases:

- **active** — for its first `activeSeconds`, it shows `title` + `target`
  (e.g. "Pour to / 60g") in accent red. This is the do-something-now window.
- **hold** — afterwards it shows `holdTitle` + `holdInstruction` and counts
  down to the next step (e.g. "Bloom / 12s").

`stepAt(recipe, elapsed)` resolves elapsed time to the current step, which
phase it is in, and how long until the next one.

### `src/components/useBrewTimer.ts`

Elapsed time is derived from a `performance.now()` anchor, **not** accumulated
per tick. If the tab is throttled or frames drop, the clock is still correct on
the next paint. `pause` freezes the value, `play` re-anchors, `seek` jumps.
Don't "simplify" this into a `setInterval` counter — the number on screen is
telling someone when to stop pouring.

## Adding a recipe

1. Append a `Recipe` to `RECIPES` in `src/lib/recipes.ts`.
2. Give every step an absolute `at`. The last step should be a `serve` step at
   `totalSeconds`, which is what ends the brew.
3. `prepFor(...)` generates the standard five-line prep checklist; pass a
   custom `prep` array instead if the method needs different setup.
4. Nothing else needs touching — the chooser and the route both read `RECIPES`,
   and `generateStaticParams` picks the new id up automatically.

## Lessons learned

- **Don't sync brew phase into state with an effect.** The finish screen is
  derived directly from `timer.finished`. An earlier version tracked a
  `"done"` phase in `useState` and set it inside `useEffect`, which trips
  `react-hooks/set-state-in-effect` and allows a frame where the clock has run
  out but the UI hasn't caught up.
- **Steps are absolute, not relative.** Storing durations and summing them
  makes skip/seek and pause drift. `at` is the source of truth.

## Deployment

- **GitHub**: [theebh76/coffee-recipe](https://github.com/theebh76/coffee-recipe) (public)
- **Vercel project**: `theebh-6436s-projects/coffee-recipe`
- **GitHub -> Vercel is connected**, unlike mediakit — `vercel link` wired it
  up, so a push to `main` deploys on its own. Manual deploys are still
  `vercel deploy --prod --yes`.

**Deployment Protection is ON** (`ssoProtection: all_except_custom_domains`),
Vercel's default for new projects. Every deployment URL 302s to a Vercel SSO
login, so the site is not publicly reachable and cannot be verified in
production. To open it up:

```
vercel project protection disable sso
```

or dashboard -> coffee-recipe -> Settings -> Deployment Protection -> Vercel
Authentication -> Disabled. Mediakit does not have this on, which is why that
site is publicly viewable and this one is not.

Local: `npm run build`, `npm run dev`.
