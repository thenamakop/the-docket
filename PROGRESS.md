# Build Progress Log

## Phase 0 — Repo bootstrap

Status: complete

Summary: Scaffolded Next.js 16.2.10 + TypeScript + Tailwind CSS v4 with `src/` directory, installed all Phase 0 dependencies (Supabase, Tiptap, sanitize-html, lucide-react, @vercel/og, reading-time), initialized shadcn/ui with dialog/sheet/command/button/input/textarea/select, configured ESLint + Prettier (single quotes, semi, trailing commas), created the full Section 9 folder structure, added the README, and added minimal page/route/middleware exports so `npm run lint` and `npm run build` pass. Dev server starts cleanly on localhost:3000.

Deviations from SPEC.md:

- `create-next-app@latest` installed Next.js 16.2.10 instead of the spec's Next.js 15. I kept it because it is the current stable release from the requested scaffolding command and is compatible with the rest of the stack. If you want Next 15, I can downgrade before Phase 1.
- Tailwind CSS v4 does not use `tailwind.config.ts`; configuration lives in `src/app/globals.css`. I still created an empty `tailwind.config.ts` as listed in the repo structure, but Phase 1's token work will go through CSS variables in `globals.css`.
- Placeholder pages and route handlers received minimal exports (empty components / stub handlers) so the build passes. The spec said one-line comments were fine, but Next.js type checking requires actual module exports.

Decisions not fully specified:

- Committed each major Phase 0 sub-task as a separate commit, per your earlier instruction.
- Prettier config: `trailingComma: "es5"`, `printWidth: 80`, `tabWidth: 2`.
- ESLint config extends `eslint-config-prettier` via the flat-config import.
- `src/middleware.ts` stub uses a no-op `middleware()` function matched to `/admin/:path*`; real auth guard in Phase 3.

## Phase 1 — Design tokens + layout shell

Status: complete

Summary: Implemented the full editorial token system in `src/styles/globals.css` (7 colors, 4 font roles, dark mode overrides) and registered them as Tailwind v4 theme keys. Configured `next/font/google` for Fraunces, Newsreader, Public Sans, and IBM Plex Mono. Added `next-themes` with a `ThemeProvider` wrapper. Built `Header` (masthead, nav links, search trigger, dark toggle, sticky scroll border) and `Footer` (about, subscribe, social, pull-quote) and wired both into `layout.tsx`. Replaced the default Next.js home page with a blank placeholder. Verified `npm run lint`, `npm run build`, and `npm run dev` all pass; no raw hex codes in components.

Deviations from SPEC.md:

- The spec says `src/styles/globals.css`; this is where tokens live. Phase 0 had created `src/app/globals.css` for Tailwind v4 imports, so that content was moved to `src/styles/globals.css` and the old file removed.
- Tailwind v4 uses CSS-based `@theme inline` instead of `tailwind.config.ts`, so tokens are registered there. `tailwind.config.ts` remains an empty placeholder from Phase 0.
- `Fraunces` was loaded with weights 400/500/600 as specified; optical sizing is not explicitly enabled because `next/font/google` does not expose a straightforward optical-sizing axis for static weight loading. If optical sizing is critical, we can switch to the variable version with axes later.

Decisions not fully specified:

- Nav links route to `/`, `/section/book-reviews`, `/section/personal-essays`, and `/section/poetry-fiction`. The two remaining sections (`law-justice`, `criminal-justice`, `guest-posts`) are not in the top nav and will be reachable via the filter drawer in Phase 5.
- Header nav uses `uppercase tracking-[0.08em]` as a practical small-caps treatment since Public Sans does not ship true small caps.
- Footer social placeholders use the `X` icon (lucide-react's name for the Twitter/X mark) and `Rss`.
- Subscribe form is client-side no-op; real wiring in Phase 7.
- Focus rings use `focus-visible:ring-oxblood` for keyboard visibility.

## Phase 2 — Supabase setup + home page

Status: not started

## Phase 3 — Admin panel

Status: not started

## Phase 4 — Post detail page

Status: not started

## Phase 5 — Section / archive pages + filter drawer

Status: not started

## Phase 6 — Search + dark mode polish

Status: not started

## Phase 7 — Newsletter, RSS, SEO, deploy, handoff

Status: not started
