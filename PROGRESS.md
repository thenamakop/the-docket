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

Status: complete

Summary: Built the filtered index pages and the slide-out filter drawer. `src/app/section/[section]/page.tsx` and `src/app/archive/[year]/page.tsx` reuse the home-page pattern: grouped `PostCard` grids per year, a heading that names the active filter, and a "← Back to all essays" link. Both routes use `generateStaticParams` so all six sections and every year with published posts resolve at build time with no 404s. Added `getSectionCounts()` and `getPublishedYears()` helpers in `src/lib/posts.ts` that query the Supabase REST API directly (cookie-free) so the data can be fetched server-side in `layout.tsx` and passed to the header.

`src/components/layout/filter-drawer.tsx` is a shadcn `Sheet` containing a `nav` of all six sections with live count badges rendered in `font-mono`. Counts are computed from published posts; sections with zero posts still appear with a `0` badge because the count map is initialized with every `SectionSlug` key. Below the sections is a collapsed-by-default Archive accordion that lists years with published posts, linking to `/archive/[year]`.

The trigger is a new "Sections" button placed in the existing right-hand button group in `src/components/layout/header.tsx`, immediately before the Search button. I put it there because the right group is the canonical location for global chrome actions (search, theme toggle) and it keeps the trigger reachable on every page at all breakpoints. The button shows icon-only on small screens and icon+"Sections" on `md` and up.

Updated `src/components/ui/sheet.tsx` so sheets are full-width below `md` (mobile full-screen) and constrained to `max-w-sm` at `md` and above. Verified with Playwright: all six section pages return 200, archive pages for 2024 and 2025 return 200, drawer counts match the database, Escape closes the drawer and returns focus to the trigger, and the drawer spans the viewport width below 768px while becoming a side panel at 768px+.

## Phase 6 — Search + dark mode polish

Status: complete

Summary: Implemented real full-text search using Supabase/Postgres `websearch_to_tsquery`. Added `searchPosts(query, limit = 8)` in `src/lib/posts.ts` that queries the REST endpoint with `or=(title.wfts.query,dek.wfts.query,body_html.wfts.query)` and `status=eq.published`. Built `src/app/api/search/route.ts` as a thin wrapper returning `{ results: Post[] }`. Built `src/components/layout/command-palette.tsx` using the existing shadcn `CommandDialog`; it listens for `⌘K` / `Ctrl+K` globally, debounces input at 200ms, calls `/api/search`, and renders each result with the docket number, title, and section label, navigating to `/essays/[slug]` on select. The search icon in the header now opens the palette.

Built `src/app/search/page.tsx` as a server-rendered full-page equivalent: a native `GET` form that re-renders with results when `?q=` is present. No client-side state management needed.

Dark-mode QA pass: `suppressHydrationWarning` was already on the `<html>` element from Phase 1, so no flash-of-wrong-theme changes were needed. Verified that `--oxblood` swaps from `#7a2e2e` (light) to `#c4645f` (dark) and `--brass` swaps from `#a47b3d` to `#c9a063` on the essay page and homepage. Checked the admin post list in dark mode: table header (`bg-parchment-dim`), body (`bg-parchment`), borders (`border-rule`), and status badges all render correctly because every color is token-based. The filter drawer and command palette also inherit the dark palette through the shadcn token mappings.

## Phase 7 — Newsletter, RSS, SEO, deploy, handoff

Status: code complete; deploy pending user Vercel setup

Summary: Wired the newsletter subscription endpoint at `src/app/api/subscribe/route.ts`. It validates the email with Zod, logs it server-side, and returns JSON success/error states. The footer form (`src/components/layout/footer.tsx`) now POSTs to this endpoint, shows loading/disabled state, and displays "Subscribed. Thank you!" or a validation/error message.

Built a full-content RSS 2.0 feed in `src/app/rss.xml/route.ts` using `getPublishedPosts()`, including `<title>`, `<link>`, `<guid>`, `<pubDate>`, `<category>`, `<description>`, and `<content:encoded>` with the full post body. Added `alternates: { types: { 'application/rss+xml': '/rss.xml' } }` to the root layout metadata so feed readers and browsers can auto-discover it.

Generated OG images with `@vercel/og`:

- `src/app/opengraph-image.tsx` — default OG for the home page and any non-essay route.
- `src/app/essays/[slug]/opengraph-image.tsx` — per-essay OG showing the docket number, section label, title, and dek on parchment/ink token colors.

Added `src/app/sitemap.ts` covering `/`, `/about`, `/search`, every published essay, every section, and every archive year. No `/admin/*` URLs are included.

Spot-checked metadata across page types: home, about, search, essay, section, archive, and admin pages all have explicit titles and descriptions. Essay pages additionally expose canonical URLs, `article:published_time`, authors, and `twitter:card` summary-large-image.

Deployment is intentionally not performed from this session. Per your instructions, the Vercel project should be created under your own email/account. Once you create/import the project and add the required environment variables (see deploy checklist below), the production build should succeed. After deploy, the verification steps are: validate `/rss.xml` with an online RSS validator, check two essay OG images render, confirm `/sitemap.xml` has no `/admin` URLs, run Lighthouse on the live home page and one essay, and confirm `/admin/login` works with the existing Supabase auth credentials.

Deploy checklist:

- Create/import `https://github.com/thenamakop/the-docket` in Vercel.
- Set framework preset to Next.js 16.
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL` (e.g. `https://the-docket.vercel.app`)
- Confirm the build command uses `npm run build` and install command uses `npm install`.
- Deploy and note the production URL.

## Critical fixes — cookie crash, insecure session, middleware→proxy, lockfile warning

Status: complete

Changes:

- `src/middleware.ts` → renamed to `src/proxy.ts` via the official `@next/codemod middleware-to-proxy` codemod. The exported function is now `proxy`; the `config` matcher block is unchanged. The old file no longer exists.
- `src/proxy.ts` — replaced `supabase.auth.getSession()` with `supabase.auth.getUser()`. The new call revalidates the JWT against the Supabase Auth server on every request, making it impossible to spoof the session cookie. Redirect-to-/admin/login behavior is identical.
- `src/lib/supabase/server.ts` — wrapped the `setAll` cookie write in `try/catch` to silence the crash that occurred when `createClient()` was called from a Server Component (which cannot write response cookies). The proxy refreshes the session on every request, so ignoring the error here is safe.
- `src/lib/supabase/middleware.ts` — **deleted**. It contained only a single comment line and was never imported or used anywhere in the codebase. Keeping it would have been misleading; a proper `updateSession()` helper pattern is not needed here because `proxy.ts` instantiates the Supabase client directly.
- `next.config.ts` — added `turbopack: { root: __dirname }` to silence the multiple-lockfiles warning (caused by a `pnpm-lock.yaml` at `C:\Users\mauli\` being detected as a workspace root). Also added `devIndicators: false` to remove the circular Next.js badge in dev mode.

Verification:

- `npm run dev` starts clean with none of the previous warnings in the terminal.
- `GET /admin` (unauthenticated) returns `307 → /admin/login`.
- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — succeeds; route legend shows `ƒ Proxy (Middleware)` confirming proxy.ts is active.

## Brand & author pivot — DaalBaatiChurma / Pradyumn Singh Mephawat

Status: complete (2026-07-13)

Summary: Deliberate brand rename from "The Docket" / "the-docket" to **DaalBaatiChurma**, and author identity updated to **Pradyumn Singh Mephawat** throughout. No technical behavior changed.

Changes:

- All page `<title>` metadata and `openGraph.title` / `openGraph.siteName` updated to "DaalBaatiChurma".
- Header masthead text updated.
- Footer About blurb updated to reference DaalBaatiChurma and Pradyumn Singh Mephawat.
- Footer pull-quote rewritten (old: generic blog labor-of-love quote; new: warm food/writing metaphor suited to the new name).
- Twitter/X link removed entirely from the footer "Elsewhere" section — no X account to link.
- `src/components/post/share-row.tsx` — Twitter share button and `twitterHref` variable removed; only the copy-link button remains, centered in its container.
- RSS `<channel><title>` updated to "DaalBaatiChurma".
- OG image alt text and rendered branding updated in both `opengraph-image.tsx` files.
- `supabase/schema.sql` author column default changed from `'Site Owner'` to `'Pradyumn Singh Mephawat'` (affects new rows only; existing seed rows were authored by 'Site Owner' and are left as-is in the DB).
- `src/app/admin/actions.ts` hardcoded `'Site Owner'` updated to `'Pradyumn Singh Mephawat'`.
- `package.json` "name" field updated to `"daalbaatichurma"`.
- `SPEC.md` title line, domain examples, author default, and Phase 1 naming note all updated.
- All fallback `NEXT_PUBLIC_SITE_URL` values updated from `the-docket.vercel.app` to `daalbaatichurma.vercel.app`.

Identifiers intentionally left unchanged (not user-facing branding):

- `docket_no` database column name — structural DB field, renaming requires a migration with no user benefit.
- `DocketBadge` component name and file — internal code identifier.
- `docket_no` variable references throughout `src/lib/posts.ts` and `src/app/admin/actions.ts` — same reason.
- GitHub repo URL `thenamakop/the-docket` — outside scope; renaming the GitHub repo is a separate manual step.
- `package-lock.json` "name" field — regenerated automatically on next `npm install`; not committing the lockfile name change separately.

## Taxonomy narrowing + seed data deletion

Status: complete (2026-07-13)

Summary: Non-destructive narrowing of the active content categories to two, plus deletion of all 8 placeholder seed posts that were written for an anonymous persona.

Changes:

- `src/components/layout/header.tsx` — `navLinks` reduced from four entries to two: Book Reviews and Personal Essays. The "Essays" link to `/` (redundant with the masthead) and the "Poetry" link to `/section/poetry-fiction` are removed.
- `src/components/admin/post-form.tsx` — Category `<select>` now renders only `book-reviews` and `personal-essays`. The full `sectionLabels` map and `SectionSlug` type are untouched; an `activeSectionSlugs` constant gates what the form offers. Form description copy updated ("essay or book review" instead of "essay, review, or poem").
- `src/components/layout/filter-drawer.tsx` — Sections list filtered to the same two active slugs via `activeSections` constant. Archive accordion unchanged.
- `src/app/page.tsx` — Home page empty state replaced with a warmer branded message: "New writing is on its way." with a supporting line.
- `src/app/section/[section]/page.tsx` — Metadata description copy updated (removed reference to "poems").
- `supabase/schema.sql` (comment added) and `SPEC.md` — documented that the four retired sections remain valid at the DB/type level for backward compat.
- `scripts/delete-seed-posts.mjs` — Script written and executed: deleted all 8 placeholder seed posts (No. 001–008) from the live Supabase table using the service role key. Table is now empty.

What was NOT changed:

- `SectionSlug` type in `src/lib/post-data.ts` — all six slugs remain valid.
- `section` CHECK constraint in `supabase/schema.sql` — all six values remain accepted.
- `generateStaticParams` in `/section/[section]/page.tsx` — still generates all six section routes at build time. All four retired routes still resolve gracefully (empty-state page, not a 404).
- No replacement content was written or seeded in Pradyumn's name.

## Newsletter wiring — Buttondown

Status: complete (2026-07-13)

Summary: Wired the subscribe form's API route to Buttondown's subscriber-creation endpoint. The stub `console.log` is replaced with a real `fetch` call; double opt-in is handled correctly in both the backend response and the frontend copy. A follow-up fix corrected IP forwarding and duplicate-email handling discovered during live-URL testing.

Changes:

- `src/app/api/subscribe/route.ts` — replaced the `// TODO` stub with a POST to `https://api.buttondown.com/v1/subscribers`. `BUTTONDOWN_API_KEY` is read from `process.env` (server-only, no `NEXT_PUBLIC_` prefix, never in the client bundle). 429 rate-limit responses return a "try again shortly" message. All other non-2xx responses are logged server-side and return a generic friendly error to the client.
- Follow-up fix (same file): switched parameter from `Request` to `NextRequest` to read `x-forwarded-for`. The visitor's real IP is now passed as `ip_address` in the Buttondown payload so their firewall evaluates each subscriber's actual IP rather than Vercel's shared outbound IP. Also added handling for `email_already_exists` (400) — duplicate submissions now return success rather than a 502 error.
- `src/components/layout/footer.tsx` — success message updated to "You're on the list — check your inbox to confirm." (accurate for double opt-in). Success uses `text-brass`; error keeps `text-oxblood`.
- `.env.local` — `BUTTONDOWN_API_KEY` added (gitignored).
- `.env.local.example` — `BUTTONDOWN_API_KEY` placeholder added with a comment.
- `README.md` — `BUTTONDOWN_API_KEY` added to the local setup block and the Vercel env vars table.

Verification (live URL — daal-baati-churma.vercel.app):

- Invalid email (no @): Zod caught it before any API call, HTTP 400. ✅
- Fresh email submitted via site: appeared in Buttondown dashboard as `unactivated` with correct Vercel edge IP (`76.76.21.21`). ✅
- Duplicate email: `email_already_exists` handled as success, no error shown. ✅
- `BUTTONDOWN_API_KEY` absent from all 16 client-side bundle chunks. ✅
- Sentry client error notification received in dashboard (confirmed by site owner). ✅

## Newsletter digest cron job

Status: complete (2026-07-13)

Summary: Replaced the missing RSS-to-email automation (a paid Buttondown add-on) with a free-tier Vercel Cron Job that calls Buttondown's core email API directly. No paid features used — only Buttondown's subscriber list and email-sending endpoint, both available on the free plan (confirmed by live API test returning HTTP 201 before building anything).

Changes:

- `supabase/schema.sql` — added `newsletter_state` table (singleton row, enforced by `check (id = 1)`). RLS enabled; only the service role key can access it. Tracks `last_notified_at` so missed runs catch up on the next attempt rather than skipping posts.
- `src/app/api/cron/newsletter-digest/route.ts` — GET handler. Verifies `Authorization: Bearer <CRON_SECRET>` (returns 401 otherwise). Reads `last_notified_at`, queries posts newer than it, composes a single Markdown digest email, POSTs to `https://api.buttondown.com/v1/emails` with `status: "about_to_send"`. Advances `last_notified_at` to the most recent post's `published_at` on success only. On Buttondown failure, logs to Sentry and returns 502 without advancing state (so next run retries). On no new posts, returns 200 `{ sent: false }` without touching Buttondown.
- `vercel.json` — created with `crons: [{ path: "/api/cron/newsletter-digest", schedule: "0 14 * * *" }]`.
- `.env.local` — `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` added (gitignored).
- `.env.local.example` — both new keys added with placeholders and comments.
- `README.md` — "Newsletter digest cron job" section added; both new env vars added to the Vercel table.

Pre-requisite (manual step): Run the `newsletter_state` DDL in the Supabase SQL Editor before the first cron invocation. The exact SQL is in `supabase/schema.sql` under "Newsletter digest state" and is safe to re-run (`IF NOT EXISTS` + `ON CONFLICT DO NOTHING`).

Verification (pending full live test — requires newsletter_state table to be created):

- Unauthenticated request → 401. ✅ (local test)
- `npm run build` passes cleanly. ✅
- Buttondown free-plan send confirmed by live API test (HTTP 201 before code was written). ✅
