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

Status: complete

Summary: Wrote `supabase/schema.sql` with the exact `posts` table and RLS policies from SPEC.md Section 4, plus 8 original seed posts across 5 sections and 2 years. Created `.env.local.example` and populated `.env.local` with the supplied Supabase credentials. Built `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` using `@supabase/ssr`, and `src/lib/posts.ts` with typed public query helpers (`getPublishedPosts`, `getPostBySlug`, `getPostsBySection`, `getPostsByYear`, `getRelatedPosts`). Built `docket-badge.tsx` and `post-card.tsx`. Built the home page with hero spotlight, year-grouped Volume Index, and 20-post pagination, `export const revalidate = 60`. Ran `schema.sql` against the Supabase project via direct Postgres connection; all 8 seed posts inserted without constraint errors. Verified `npm run build` passes and the home page renders real data, with the hero post (No. 006) also appearing in its year group.

Deviations from SPEC.md:

- None for the data model; the table and RLS policies match SPEC.md verbatim.
- Tailwind v4 / shadcn Base UI `Button` does not support the Radix `asChild` prop, so the hero CTA and pagination controls use styled `Link` elements directly.

Decisions not fully specified:

- Seed posts are original prose, 300-500 words each, across `law-justice`, `criminal-justice`, `book-reviews`, `personal-essays`, `poetry-fiction`, and `guest-posts`.
- Hero uses the most recent published post (`published_at` desc). No. 006 is currently the hero because it has the latest `published_at`.
- Temporary `pg` package was installed to run `schema.sql` via direct Postgres and then uninstalled; it is not part of the project dependencies.
- `.env.local` is gitignored and contains the real Supabase URL + anon key.

## Phase 3 — Admin panel

Status: complete

Summary: Built the full non-technical authoring experience. Created the single Supabase Auth user (`maulikgupta21@gmail.com`) and confirmed the email via SQL. Implemented `src/middleware.ts` with session protection and `X-Robots-Tag: noindex` for all `/admin/*` routes. Built `src/app/admin/login/page.tsx` with a plain error message. Built `src/app/admin/page.tsx` post list with status badges, edit/delete actions, and a confirmation dialog. Built `src/components/admin/rich-text-editor.tsx` (Tiptap with Bold, Italic, Heading, lists, quote, link, inline image) and `src/components/admin/image-uploader.tsx` (drag-and-drop cover upload to the public `post-images` Supabase Storage bucket). Built `src/components/admin/post-form.tsx` reused by new and edit pages, with Title → Cover photo → Category → Body → Save as Draft / Publish. Server actions in `src/app/admin/actions.ts` compute slug, sequential docket number, reading time, and sanitize body HTML with `sanitize-html`. Verified via Playwright: login succeeds, creating a post with all fields and publishing it appears on the homepage within 60 seconds, incognito `/admin` redirects to `/admin/login`, editing a post's category reflects on the homepage, and the delete dialog cancels safely then confirms deletion.

Deviations from SPEC.md:

- No signup UI (intentional per spec). Additional users can be created directly in the Supabase dashboard if needed later.
- Tailwind v4 / shadcn Base UI `DialogTrigger` does not support `asChild`; used the `render` prop pattern instead.

Decisions not fully specified:

- Admin user created via Supabase Auth signup API, then email-confirmed via direct SQL (`email_confirmed_at = now()`) because the project has email confirmation enabled by default.
- The `post-images` storage bucket and policies were created via direct SQL using the database connection.
- Temporary setup/debug scripts and the `pg` package were removed after use to avoid committing credentials or unused dependencies. Only the final app code is in the repo.
- `src/lib/post-data.ts` was split out from `src/lib/posts.ts` so admin client components (e.g., `post-form.tsx`) can import types and labels without pulling the server-only Supabase client into the browser.

## Phase 4 — Post detail page

Status: complete

Summary: Built the essay reading page at `src/app/essays/[slug]/page.tsx`. The header renders the docket badge, brass section label, large display title, italic dek, author, and a real `<time datetime="...">` element. The body is wrapped in `.essay-body` with a max-width of ~68ch, Newsreader body font at 18–20px, and line-height 1.65. CSS-only marginalia blockquotes float into the left gutter on desktop (≥1024px) with a thin oxblood vertical rule and display italic type; on mobile they collapse to an inline left-bordered quote. Added a share row (`src/components/post/share-row.tsx`) with an X/Twitter link and a copy-link button that shows a small tooltip confirmation. Related essays (`Read next`) pull up to 3 posts from the same section via `getRelatedPosts` and render with `PostCard`, gracefully showing fewer if not enough exist. Implemented `generateStaticParams` (using a new cookie-free `getPublishedSlugs` helper in `src/lib/posts.ts`) and `generateMetadata` for each post. Verified layout against a seed post and a fresh test post, confirmed pull-quote degradation at mobile widths, and ran Lighthouse on a production build: Performance 90, Accessibility 96, Best Practices 100, SEO 90. The temporary test post and Lighthouse artifacts were removed after verification.

Deviations from SPEC.md:

- None significant. Used the existing `X` icon from `lucide-react` instead of a Twitter-specific icon because the package version does not export `Twitter`.

Decisions not fully specified:

- Added `getPublishedSlugs()` that calls the Supabase REST API directly with the anon key so `generateStaticParams` can run at build time without `cookies()`.
- Lighthouse was installed temporarily for verification and then uninstalled to keep dependencies minimal.
- The copy-link tooltip shows "Link copied" on success and "Copy unavailable" as a graceful fallback when the Clipboard API is blocked.

## Phase 5 — Section / archive pages + filter drawer

Status: not started

## Phase 6 — Search + dark mode polish

Status: not started

## Phase 7 — Newsletter, RSS, SEO, deploy, handoff

Status: not started
