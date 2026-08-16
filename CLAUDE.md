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

Not yet deployed — no GitHub repo or Vercel project has been created for this
one. Build locally with `npm run build`; `npm run dev` for the dev server.
