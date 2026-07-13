# DaalBaatiChurma — Spec & Build Prompts

### A modern editorial blog, inspired by bharatchugh.in (not a 1:1 clone)

Prepared for: Maulik · Target build agent: **Kimi K2.7 Code** (256K context, forced-thinking, agentic tool use — via Kimi Code CLI, OpenRouter, or any OpenAI-compatible harness)
Author will publish posts himself via a simple form — no code, no git, no technical knowledge required. Everything below is built around that constraint.

---

## 0. Source Analysis — what bharatchugh.in actually is

Under the hood it's a stock WordPress.com theme. Structurally, though, it has a real editorial shape worth borrowing:

| Element on the source site                                    | What it's really doing                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Header: social icons, About, Subscribe, Search                | Minimal top nav, no clutter                                                              |
| Hero: full-width image + eyebrow categories + title + excerpt | One featured essay gets the spotlight                                                    |
| "Previous columns"                                            | A flat, infinite reverse-chronological list of every post (title, byline, date, excerpt) |
| "Similar posts"                                               | Related-content block, seemingly tag-based                                               |
| "Columns/Articles by month/year"                              | A 70+ entry archive-by-month list (2011–2026)                                            |
| "Categories of posts"                                         | A 70+ item flat taxonomy with counts                                                     |
| Pull quote + newsletter signup                                | "This blog is a labor of love..." + WordPress.com subscribe widget                       |
| Footer                                                        | WordPress.com boilerplate                                                                |

**Worth noting**: WordPress itself already solved "let a non-technical person publish posts" — that's literally wp-admin's whole job. The clone needs to solve the exact same problem, just with a modern, radically simpler interface than wp-admin's cluttered dashboard, and a modern public-facing design instead of the default theme.

The clone keeps the useful IA (featured essay, chronological index, categories, archive, related posts, subscribe) but replaces the unbounded flat lists with grouped, filterable, searchable equivalents, and replaces "edit files in a repo" with "fill out a form and click Publish."

---

## 1. How This Website Actually Works (plain-English overview)

Worth reading this section together with whoever you're building this for — it's the explanation you'd give someone who will never look at code.

The website has **two halves**:

1. **The public site** — what any visitor sees when they go to the URL. Essays, book reviews, the homepage, search. Nobody needs a login to read any of this.
2. **A private "write a post" page** (`/admin`) — only the site owner can get to this, by logging in with an email and password. This is where new posts get written. Nobody else can see or reach this page.

Behind the scenes, there's one more piece:

3. **A database** — think of this as a filing cabinet living on a server, not on anyone's laptop. Every post's title, text, photo, and category is stored there. When someone writes a new post through the admin page, it gets saved into this filing cabinet. When a visitor loads the website, the site reaches into the same filing cabinet and displays whatever's there — automatically, with no extra steps.

**What "publishing a post" actually does, step by step:**

1. The site owner goes to `yoursite.com/admin` and logs in.
2. He clicks "New Post," types a title, writes the essay, optionally uploads a photo and picks a category.
3. He clicks **Publish**.
4. That post is now saved in the database. Within about a minute, it shows up on the homepage for everyone — automatically. No one needs to touch code, redeploy anything, or contact you.

**Three separate services are involved, all free:**

- **Vercel** — hosts the actual website (the pages people visit).
- **Supabase** — hosts the database (the filing cabinet) and stores uploaded photos.
- **GitHub** — stores the website's code (only relevant if the design ever needs to change — not needed for day-to-day posting).

None of these three require ongoing payment for a site at this scale. The only genuinely optional cost in the entire system is a custom domain name (instead of a free `daalbaatichurma.vercel.app` address) — that's roughly $10–15/year from any domain registrar, and only needed if a branded URL matters. Since you asked to keep this fully free, the build below defaults to the free Vercel subdomain, with a clear one-step upgrade path if a custom domain is added later.

---

## 2. Content Authoring System — the actual "new post" form

This replaces any notion of editing files. This is the entire non-technical experience:

### `/admin/login`

- Email field, password field, "Log in" button. Nothing else. One account only (the site owner's).

### `/admin` (post list, shown right after login)

- A simple table: **Title · Status (Draft/Published) · Date · [Edit] [Delete]**
- A single prominent **"+ New Post"** button at the top.

### `/admin/posts/new` (and reused for editing)

The entire form, top to bottom:

1. **Title** — plain text input.
2. **Cover photo** — a drag-and-drop / click-to-upload box. Shows a preview once uploaded. Optional.
3. **Category** — a dropdown with three active options (Book Reviews, Personal Essays, Travel Diary). Defaults to "Personal Essays" if skipped. Six legacy values remain valid at the DB level for backward compatibility (law-justice, criminal-justice, poetry-fiction, guest-posts) but are not offered in the form.
4. **Location (optional)** — a single free-form text field (e.g. "Udaipur, Rajasthan"). Shown for all posts regardless of category; leave blank for non-travel posts. Saved as `null` if empty.
5. **Write your post** — a rich text box with a small, obvious toolbar: **Bold, Italic, Heading, Bullet list, Numbered list, Quote, Insert link, Insert image**. No markdown, no code, no special syntax — this looks and behaves like a stripped-down Google Docs / Word.
6. Two buttons at the bottom: **Save as Draft** and **Publish**.

That's it — four visible fields plus the two buttons. Everything else the site needs (the URL slug, the docket number, reading time, the publish timestamp) is generated automatically in the background and never shown to the user. A blockquote inserted via the "Quote" toolbar button automatically gets the site's marginalia/pull-quote visual treatment on the public page — the design decision from Section 4 below happens for free, with zero extra effort from whoever's writing.

### Who can log in

One account, created once during setup, with credentials handed to the site owner directly (not emailed in plaintext — see the handoff section). If he ever wants a second person to be able to post (e.g., a guest author), that's a second Supabase Auth user added the same way — a five-minute task for you, not something he needs to self-serve.

---

## 3. Design Direction

(unchanged from the original brief — this governs the _public_ site only; the admin panel below is deliberately plain and utilitarian, not styled to the same degree, since its only user is one person who needs speed and clarity, not editorial atmosphere.)

Per the brief's genre (law + literature + personal essay), the design should feel like a well-edited literary/legal journal — not a SaaS landing page, not a generic "cream background + terracotta accent" AI-default.

**Signature idea — "the docket + the marginalia":** every essay gets a small docket-style index number (like a case citation), and pull-quotes sit as marginal annotations in the gutter rather than centered block quotes. Category tags read like wax-seal badges / file-tab labels.

### Design tokens

**Color**

| Token             | Hex       | Use                                                   |
| ----------------- | --------- | ----------------------------------------------------- |
| `--ink`           | `#1C1F2B` | Primary text                                          |
| `--parchment`     | `#FAF6EC` | Page background                                       |
| `--parchment-dim` | `#F1E9D8` | Card/panel surfaces                                   |
| `--oxblood`       | `#7A2E2E` | Primary accent — links, docket numbers, active states |
| `--brass`         | `#A47B3D` | Secondary accent — hover underline, category badges   |
| `--slate`         | `#5B5F6B` | Meta text — dates, bylines, captions                  |
| `--rule`          | `#DCD2BC` | Hairline dividers                                     |

Dark mode: `--ink` → `#EDE7D8`, `--parchment` → `#15141B`, `--parchment-dim` → `#1E1C26`, `--oxblood` → `#C4645F`, `--brass` → `#C9A063`, `--slate` → `#9B97A8`, `--rule` → `#2C2A35`.

**Type**

- Display serif: **Fraunces** — masthead, post titles, pull-quotes
- Body serif: **Newsreader** — essay body text, 18–20px, 1.65 line-height
- UI sans: **Public Sans** — nav, buttons, category tags
- Mono/utility: **IBM Plex Mono**, small caps — docket numbers, dates, reading time

**Layout concept**

```
┌─────────────────────────────────────────┐
│  masthead   nav: essays / reviews /      │
│             personal · search · ⚫ dark   │
├─────────────────────────────────────────┤
│  FEATURED ESSAY (full-bleed image left,  │
│  docket no. + title + dek right)         │
├─────────────────────────────────────────┤
│  Vol. index — grouped by year,           │
│  each entry: No. / title / dek / meta    │
├─────────────────────────────────────────┤
│  filter rail (collapsible drawer):       │
│  Sections (6 grouped) + Archive by year  │
├─────────────────────────────────────────┤
│  footer: about, subscribe, social, RSS   │
└─────────────────────────────────────────┘
```

No permanent sidebar — categories and archive live in a slide-out filter drawer, not a scroll-forever list.

---

## 4. Data Model (Supabase / Postgres)

This is the "filing cabinet" from Section 1, made concrete.

```sql
create table posts (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,        -- auto-generated from title
  docket_no             text not null unique,        -- auto-generated, "No. 001", "No. 002"...
  section               text not null default 'personal-essays'
                          check (section in (
                            'law-justice','criminal-justice','book-reviews',
                            'personal-essays','poetry-fiction','guest-posts','travel-diary'
                          )),
                          -- Active sections for new content: 'book-reviews', 'personal-essays', 'travel-diary'
                          -- The other four ('law-justice','criminal-justice','poetry-fiction',
                          -- 'guest-posts') remain valid at the DB level for backward compat
                          -- but are not offered in the admin form or shown in the nav/drawer.
  dek                   text,                        -- short excerpt; auto-derived from body if left blank
  body_html             text not null,                -- sanitized HTML from the rich text editor
  cover_image_url       text,
  author                text not null default 'Pradyumn Singh Mephawat',
  status                text not null default 'draft' check (status in ('draft','published')),
  published_at          timestamptz,
  reading_time_minutes  int,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Public visitors can only ever read published posts.
alter table posts enable row level security;
create policy "public can read published posts"
  on posts for select using (status = 'published');
create policy "authenticated user has full access"
  on posts for all using (auth.role() = 'authenticated');
```

Everything a non-technical author needs to fill in maps to exactly four form fields (title, cover image, category, body). `slug`, `docket_no`, `reading_time_minutes`, and `published_at` are computed server-side and never exposed in the UI.

Image files (cover photos + any images inserted into the body) live in a Supabase Storage bucket (`post-images`, public-read, authenticated-write) — the upload box in the form handles this invisibly and just returns a URL to store on the post.

---

## 5. Tech Stack

| Layer             | Choice                                                                                   | Why                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Framework         | Next.js 15, App Router, TypeScript                                                       | Fast, great SEO, renders straight from the database                                |
| Styling           | Tailwind CSS v4 + CSS variables (token table above)                                      | Matches your existing workflow                                                     |
| Database          | **Supabase** (hosted Postgres, free tier)                                                | Free, no server to maintain, built-in auth + storage in one place                  |
| Auth (admin only) | Supabase Auth, single email/password account                                             | Simplest possible gate — no signup flow, no roles/permissions system needed        |
| File storage      | Supabase Storage (free tier, 1GB)                                                        | Cover photos + inline post images                                                  |
| Rich text editor  | **Tiptap** (open source, free)                                                           | WYSIWYG "Google Docs lite" experience — no markdown, no code visible to the author |
| Search            | Postgres full-text search (built into Supabase, free)                                    | No extra search service needed — the database already supports this                |
| Newsletter        | Serverless API route stubbed for a provider of choice (Buttondown / ConvertKit / Resend) | Keeps it provider-agnostic until one is picked                                     |
| RSS               | Generated at request time from the same database query used on the homepage              | Cheap, expected for a blog                                                         |
| Deployment        | **Vercel** (free tier)                                                                   | Zero-config for Next.js                                                            |
| Icons             | `lucide-react`                                                                           | Consistent, accessible icon set                                                    |
| Components        | `shadcn/ui` primitives (dialog, sheet, command), themed to the tokens above              | Accessible out of the box                                                          |

Pages render with `export const revalidate = 60` — every page re-checks the database at most once a minute, so a freshly published post appears site-wide within about 60 seconds with zero manual steps (no "rebuild the site" button to remember, no webhook to configure).

---

## 6. Page-by-Page Spec

**Public site**

| Route                | Purpose                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/`                  | Featured essay hero + grouped-by-year volume index (paginated, 20/page)                                           |
| `/essays/[slug]`     | Post page: docket no., title, dek, body, marginal pull-quotes (auto from blockquotes), related posts, share links |
| `/section/[section]` | Filtered index for one of the 6 sections                                                                          |
| `/tag/[tag]`         | (optional, phase 2 feature — see notes)                                                                           |
| `/archive/[year]`    | Chronological index for one year                                                                                  |
| `/about`             | Author bio                                                                                                        |
| `/search`            | Full search UI (also available as ⌘K command palette)                                                             |
| `/rss.xml`           | Generated RSS feed                                                                                                |

**Admin (private)**

| Route                    | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `/admin/login`           | Email + password login                                           |
| `/admin`                 | Post list (title, status, date, edit/delete) + "New Post" button |
| `/admin/posts/new`       | The authoring form described in Section 2                        |
| `/admin/posts/[id]/edit` | Same form, pre-filled, for editing an existing post              |

Every `/admin/*` route (except `/admin/login`) is protected by Next.js middleware checking the Supabase session — an unauthenticated visitor hitting any admin URL gets redirected straight to the login page, no error page, no confusing dead end.

---

## 7. Feature Spec

- **Search**: Postgres full-text search (`tsvector`/`websearch_to_tsquery`) over title + dek + body, queried from a small API route. ⌘K opens a command palette (shadcn `CommandDialog`) hitting that route as the user types; `/search` is the full-page equivalent.
- **Filter drawer**: slide-out sheet — 6 sections as large tappable rows with live post counts (queried from the database, never hardcoded), plus a collapsed-by-default year accordion for the archive.
- **Related posts**: same-section posts, most recent first, excluding the current post, capped at 3.
- **Reading time**: computed server-side from word count when a post is saved, stored on the row — not recalculated on every page load.
- **Dark mode**: `next-themes`, respects system preference on first load, persisted after a manual toggle.
- **Newsletter**: email input in the footer + `/subscribe`, posts to a stubbed `/api/subscribe` route with a clear `// TODO: wire to <provider>` marker.
- **RSS**: generated at request time from the same published-posts query as the homepage.
- **Marginalia pull-quotes**: any `<blockquote>` produced by Tiptap's "Quote" button is styled, via CSS alone, to sit in the left gutter on desktop and as a left-bordered inline quote on mobile — no special authoring step required.

---

## 8. Non-Functional Requirements

- Responsive down to 360px; admin form especially needs to work cleanly on a phone, since the site owner may write posts from one.
- Visible keyboard focus rings on every interactive element.
- `prefers-reduced-motion` respected.
- Lighthouse targets: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 (mobile, cold cache) — measured on the public site; the admin panel is exempt from the SEO target (it's not indexed — add `noindex` there).
- OG images generated per-post at request time (`@vercel/og`) using the docket number + title.
- Semantic HTML throughout (`<article>`, `<time datetime>`, correct heading hierarchy).
- Rich text from Tiptap is sanitized server-side (`sanitize-html` or equivalent) before being stored/rendered, even though only one trusted person can author content — cheap insurance.

---

## 9. Repo Structure

```
the-docket/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # home
│   │   ├── essays/[slug]/page.tsx
│   │   ├── section/[section]/page.tsx
│   │   ├── archive/[year]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── search/page.tsx
│   │   ├── rss.xml/route.ts
│   │   ├── api/
│   │   │   ├── subscribe/route.ts
│   │   │   └── search/route.ts
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       ├── page.tsx                    # post list
│   │       └── posts/
│   │           ├── new/page.tsx
│   │           └── [id]/edit/page.tsx
│   ├── components/
│   │   ├── layout/ (header, footer, filter-drawer, command-palette)
│   │   ├── post/ (post-card, docket-badge, related-posts)
│   │   └── admin/ (post-form, rich-text-editor, image-uploader)
│   ├── lib/
│   │   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   │   ├── posts.ts                        # all database queries live here
│   │   └── reading-time.ts
│   └── middleware.ts                       # protects /admin/*
├── supabase/
│   └── schema.sql                          # the table + policies from Section 4
├── tailwind.config.ts
└── package.json
```

---

## 10. Hosting & Handoff Plan (fully free)

**Accounts needed** (create all three yourself during the build, then transfer ownership at handoff — see below):

1. **GitHub** — holds the code.
2. **Vercel** — connect it to the GitHub repo; every push to `main` auto-deploys. Free tier easily covers a personal blog's traffic.
3. **Supabase** — one free project holds the database, file storage, and the single admin login. Free tier limits (500MB database, 1GB file storage, 50,000 monthly active users on auth) are far beyond what a personal blog needs.

**Domain**: the free setup gives a URL like `daalbaatichurma.vercel.app`. If a custom domain matters, that's the one line item that costs money — about $10–15/year from any registrar (Namecheap, Google Domains' successor, etc.) — pointed at Vercel with a couple of DNS records. Entirely optional; the rest of the stack doesn't change either way.

**Recommended ownership pattern for handoff**:

- Create the Vercel and Supabase accounts using _the site owner's own email_, not yours — you work inside them as a collaborator during the build, then remove your own access once it's done. This avoids the situation where the site becomes unmanageable if you're unreachable later (e.g., once your internship or your involvement ends).
- Hand off exactly three things at the end: (1) the admin login email + password, given to him directly/verbally or via a password manager share, never over plain email or chat, (2) a one-page "How to add a new post" guide (see below), (3) confirmation that he — not you — is the account owner on Vercel and Supabase.

**A one-page non-technical guide** (worth writing once the site is live, I'm happy to draft this for you as a separate short document): "Go to yoursite.com/admin → log in → click New Post → fill in the title, write your post, add a photo if you want, pick a category → click Publish → your post appears on the homepage within about a minute." That's the entire manual he needs.

---

## 11. Build Plan — Phases

| Phase | Deliverable                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------- |
| 0     | Repo bootstrap: Next.js + TS + Tailwind + tooling                                              |
| 1     | Design tokens + global layout shell                                                            |
| 2     | Supabase setup (schema, client, queries) + home page reading from the database                 |
| 3     | Admin panel: login, post list, new/edit post form (title, image, category, rich text, publish) |
| 4     | Post detail page (typography, marginalia, related posts)                                       |
| 5     | Section / archive pages + filter drawer                                                        |
| 6     | Search (Postgres full-text + command palette) + dark mode                                      |
| 7     | Newsletter stub + RSS + SEO/OG images + deploy + handoff docs                                  |

Each phase below is a complete, paste-ready prompt for Kimi K2.7 Code. Run them in order.

---

## 12. Prompts for Kimi K2.7 Code

> Kimi K2.7 Code runs with forced thinking and works best inside **Kimi Code CLI** or any agent harness with real file read/write + shell access. If a step says "escalate," stop and show the exact error/diff rather than guessing a fix.

### Phase 0 — Repo bootstrap

```
Context: I'm starting a new Next.js 15 project called "DaalBaatiChurma" — a
personal editorial blog where the ONLY author publishes posts through a
simple admin form (no git/code editing for content). This is Phase 0 of an
8-phase build. There is no existing code in this directory.

Goal: Bootstrap a clean, correctly configured repo. No UI work yet.

Steps:
1. Scaffold with `create-next-app` — TypeScript, App Router, Tailwind CSS v4,
   src/ directory, no example content.
2. Install: @supabase/supabase-js, @supabase/ssr, @tiptap/react,
   @tiptap/starter-kit, @tiptap/extension-image, @tiptap/extension-link,
   sanitize-html, lucide-react, @vercel/og, reading-time.
3. Install shadcn/ui and initialize it. Add the `dialog`, `sheet`,
   `command`, `button`, `input`, `textarea`, and `select` components.
4. Set up ESLint + Prettier (single quotes, semi: true, trailing commas).
   Confirm `npm run lint` passes clean.
5. Create the folder structure exactly as specified below — empty files
   with a one-line comment describing intended purpose are fine for now:
   [paste the repo structure from Section 9 above]
6. Add a root README.md: project name, one-paragraph description,
   `npm run dev` instructions, and a note that content is authored
   through /admin, not through files in this repo.
7. Do NOT write any component logic, page content, database code, or
   styling yet — this phase is tooling only.

Verification:
- `npm run dev` starts with no errors on a blank default page.
- `npm run lint` and `npm run build` both pass clean.
- Show me the final folder tree.

If blocked: if any package fails to install or conflicts with Next 15 /
React 19 peer deps, stop and show me the exact error — don't downgrade
Next.js or swap packages without asking.
```

### Phase 1 — Design tokens + global layout shell

```
Context: Phase 0 is complete. Read src/app/layout.tsx and
tailwind.config.ts before changing anything.

Goal: Implement the full design token system and a static header/footer
shell — no page content yet, just the frame every page sits inside.

Design tokens (light mode):
  --ink: #1C1F2B, --parchment: #FAF6EC, --parchment-dim: #F1E9D8,
  --oxblood: #7A2E2E, --brass: #A47B3D, --slate: #5B5F6B, --rule: #DCD2BC

Dark mode overrides:
  --ink: #EDE7D8, --parchment: #15141B, --parchment-dim: #1E1C26,
  --oxblood: #C4645F, --brass: #C9A063, --slate: #9B97A8, --rule: #2C2A35

Fonts (next/font/google): Fraunces (display, weights 400/500/600, optical
sizing) for headings and pull-quotes; Newsreader (body, weight 400,
italic available) for essay body text; Public Sans (weights 400/500/600)
for all UI chrome; IBM Plex Mono (weight 500) for docket numbers, dates,
reading time — small caps, +0.04em letter-spacing.

Steps:
1. Define all tokens as CSS variables in src/styles/globals.css, both
   :root and .dark blocks. Wire next-themes for the dark mode toggle.
2. Extend tailwind.config.ts so these are usable as Tailwind classes
   (bg-parchment, text-ink, text-oxblood, border-rule, font-display,
   font-body, font-ui, font-mono). Never hardcode hex values in
   components.
3. Build src/components/layout/header.tsx: masthead (font-display), nav
   links (Essays / Book Reviews / Personal / Poetry — font-ui, small
   caps), a search icon button (no-op for now — wired in Phase 6), and a
   functional dark mode toggle. Sticky on scroll with a border-rule
   bottom border that appears only after scrolling past 0.
4. Build src/components/layout/footer.tsx: About column (placeholder
   bio), Subscribe column (email input + button, no-op for now), Social
   column (placeholder icon links). Below, a full-width italic
   font-display pull-quote (placeholder mission-statement text).
5. Wire both into src/app/layout.tsx. Confirm the frame renders correctly
   at 360px, 768px, and 1440px widths.

Verification:
- Toggle dark mode, confirm every token flips with no hardcoded colors
  leaking through (grep your new components for raw hex codes — there
  should be none).
- Tab through the header with keyboard only, confirm visible focus rings.

If blocked: if next/font causes a build error with the exact weights
listed, tell me which weights are actually available before substituting.
```

### Phase 2 — Supabase setup + home page

```
Context: Phases 0-1 complete. Read src/styles/globals.css and
src/components/layout/header.tsx before writing new code.

Goal: Stand up Supabase (database schema, client, queries) and build the
home page reading real data from it.

Steps:
1. Write supabase/schema.sql with exactly this table (copy verbatim, this
   is the single source of truth for the data model):
   [paste the full `create table posts (...)` block plus the two RLS
   policies from Section 4 above]
2. Create src/lib/supabase/client.ts (browser client) and
   src/lib/supabase/server.ts (server client using @supabase/ssr,
   reading env vars NEXT_PUBLIC_SUPABASE_URL and
   NEXT_PUBLIC_SUPABASE_ANON_KEY — add a .env.local.example listing
   both, never commit real values).
3. Create src/lib/posts.ts with typed query functions:
   getPublishedPosts(), getPostBySlug(slug), getPostsBySection(section),
   getPostsByYear(year), getRelatedPosts(currentId, section, limit=3).
   Every function only returns status = 'published' rows for public
   pages — never expose drafts outside /admin.
4. Seed 8 sample posts directly via SQL insert statements at the bottom
   of schema.sql (ORIGINAL placeholder text, roughly 300-500 words each,
   spread across at least 4 of the 6 sections and at least 2 different
   years, with sequential docket numbers No. 001 - No. 008). Do not copy
   text from any real blog.
5. Build src/components/post/docket-badge.tsx (docketNo + readingTime,
   font-mono, small caps) and src/components/post/post-card.tsx (title,
   docket-badge, dek, section label in brass).
6. Build the home page (src/app/page.tsx), `export const revalidate = 60`:
   - Hero: the single most recent published post, full-bleed treatment.
     Falls back to a solid parchment-dim panel if cover_image_url is null.
   - "Volume Index" below: all published posts grouped by year
     (descending), each year as a font-display heading, posts within a
     year via post-card, most recent first.
   - Paginate at 20 posts per page (build it even with only 8 seed posts).

Verification:
- Run the schema.sql against your Supabase project and confirm all 8
  seed posts insert without constraint errors.
- `npm run build` succeeds with the home page rendering real data from
  Supabase, not placeholders.
- Confirm the hero post still also appears correctly grouped under its
  year in the index below (it's a spotlight, not a removal from the list).

If blocked: if RLS policies block the anon client from reading published
posts, stop and show me the exact Postgres error — don't disable RLS to
work around it.
```

### Phase 3 — Admin panel (login, post list, new/edit form)

```
Context: Phases 0-2 complete (Supabase wired, home page reading real
data). Read src/lib/supabase/server.ts and src/lib/posts.ts before
writing new code — reuse the existing client setup, don't create a
second one.

Goal: Build the entire non-technical authoring experience described
below. This is the most important phase for the end user — it must be
simple enough that someone with no technical background can use it
without instructions beyond "log in, fill it in, click Publish."

Steps:
1. In the Supabase dashboard (or via a one-time script), create exactly
   ONE auth user (email + password) — tell me the email you used so I
   can hand off the password separately. Do not build a signup flow —
   there is intentionally no way to create additional accounts through
   the UI.
2. Build src/middleware.ts: any request to /admin/* except /admin/login
   checks for a valid Supabase session; redirect to /admin/login if
   absent. Add `X-Robots-Tag: noindex` to all /admin/* responses.
3. Build src/app/admin/login/page.tsx: email field, password field,
   "Log in" button, calling Supabase Auth's signInWithPassword. Show a
   plain, non-technical error message on failure ("Email or password
   didn't match — try again"), never raw error codes.
4. Build src/app/admin/page.tsx (post list): a simple table — Title,
   Status (Draft/Published as a colored badge), Date, Edit link, Delete
   button (with a confirmation dialog before actually deleting). A
   prominent "+ New Post" button above the table. Include a "Log out"
   control.
5. Build src/components/admin/rich-text-editor.tsx using Tiptap
   (StarterKit + Image + Link extensions) with a visible toolbar:
   Bold, Italic, Heading, Bullet list, Numbered list, Quote, Insert
   link, Insert image. No markdown syntax should ever be visible to the
   user — this is a WYSIWYG box.
6. Build src/components/admin/image-uploader.tsx: a drag-and-drop /
   click-to-upload box that uploads directly to the Supabase Storage
   `post-images` bucket (create the bucket, public-read, authenticated-
   write) and returns a public URL. Show a thumbnail preview once
   uploaded, and a way to remove/replace it before saving.
7. Build src/components/admin/post-form.tsx, reused by both
   src/app/admin/posts/new/page.tsx and
   src/app/admin/posts/[id]/edit/page.tsx. Visible fields, in this exact
   order: Title (text input) → Cover photo (image-uploader) → Category
   (a <select> with the 6 plain-language section names) → "Write your
   post" (rich-text-editor) → two buttons: "Save as Draft" and
   "Publish". Do NOT show slug, docket number, reading time, or
   published_at anywhere in this form — compute all of them server-side:
   - slug: lowercase, hyphenated from title, with a numeric suffix if a
     collision exists
   - docket_no: next sequential number across all posts, zero-padded
     ("No. 009")
   - reading_time_minutes: computed from the word count of body_html
   - published_at: set to now() only when "Publish" is clicked (stays
     null for drafts)
8. Sanitize body_html server-side with sanitize-html before every
   insert/update, stripping any script tags or event handler attributes,
   even though only one trusted user can submit this form.

Verification:
- Log in with the one seeded account, create a brand-new post using
  every field (title, photo, category, formatted body with a bullet
  list, a quote block, and an inline image), and Publish it.
- Confirm it appears on the public homepage within 60 seconds without
  any manual action.
- Confirm an incognito/logged-out browser hitting /admin or
  /admin/posts/new redirects straight to /admin/login.
- Edit the post you just created, change its category, and confirm the
  change reflects on the public site after the next revalidation.
- Delete a test post and confirm the confirmation dialog actually
  prevents accidental deletion (cancel it once, then confirm it for
  real).

If blocked: if Supabase Auth session handling behaves differently
between the Next.js middleware and server components (a common
@supabase/ssr gotcha), stop and show me exactly which check is failing
rather than disabling the auth guard to "get it working."
```

### Phase 4 — Post detail page

```
Context: Phases 0-3 complete (admin panel working, at least one real post
exists). Read src/components/post/docket-badge.tsx,
src/components/post/post-card.tsx, and src/lib/posts.ts before writing
new code.

Goal: Build the essay reading page at src/app/essays/[slug]/page.tsx.

Steps:
1. Page header: docket-badge, section label (brass), title (font-display,
   large), dek (font-body italic, slate), author + published_at
   (font-mono, small, real <time datetime="..."> element).
2. Body: render the stored body_html at a max-width of ~68ch, font-body,
   18-20px, line-height 1.65.
3. Marginalia styling for pull-quotes: any <blockquote> inside the
   rendered body_html should, via CSS only (no component needed, since
   the content is plain HTML from Tiptap), sit in the LEFT gutter on
   desktop (≥1024px) connected to its paragraph by a thin oxblood
   vertical rule, text in font-display italic. On mobile, collapse to an
   inline left-bordered quote, still visually distinct from body text.
4. Related essays: below the body, "Read next" — up to 3 posts from the
   same section via getRelatedPosts, rendered with post-card. Show fewer
   than 3 gracefully if not enough exist — don't pad with unrelated posts.
5. Share row: icon links (X/Twitter, copy-link button with a toast
   confirmation).
6. generateStaticParams for all published slugs; generateMetadata using
   title + dek for each post.

Verification:
- Visit the real post created in Phase 3 and at least one seed post,
  confirming layout holds up for both.
- Resize to mobile width, confirm the pull-quote degrades correctly.
- Run Lighthouse on this page — flag anything under 90 performance / 95
  accessibility rather than accepting it silently.

If blocked: if a syntax-highlighting need comes up for code blocks
inside posts, tell me the bundle-size tradeoff of your chosen library
before committing to it.
```

### Phase 5 — Section / archive pages + filter drawer

```
Context: Phases 0-4 complete. Read src/components/layout/header.tsx
before changing it.

Goal: Build the filtered index pages and the slide-out filter drawer.

Steps:
1. Build src/app/section/[section]/page.tsx and
   src/app/archive/[year]/page.tsx — reuse the grouped post-card list
   pattern from the home page, pre-filtered, with a heading naming the
   active filter and a "back to all essays" link.
2. Build src/components/layout/filter-drawer.tsx (shadcn `Sheet`),
   triggered from a new "Sections" button in the header:
   - 6 section rows (font-ui, medium weight) each with a live count
     badge (font-mono) queried from the database — never hardcoded.
   - A collapsed-by-default "Archive" accordion listing years with
     at least one published post, linking to /archive/[year].
3. On mobile (<768px), the drawer becomes full-screen.
4. Wire the trigger into the existing header — read the current header
   code first and tell me where you're placing it and why.

Verification:
- Every section present among published posts resolves with no 404s.
- Counts in the drawer match actual published post counts per section.
- Keyboard-only: open with keyboard, tab through all rows, close with
  Escape, confirm focus returns to the trigger button.

If blocked: if a section has zero published posts, still show it in the
drawer with a "0" count rather than hiding it.
```

### Phase 6 — Search + dark mode polish

```
Context: Phases 0-5 complete. Dark mode toggle already exists (Phase 1).
Read src/lib/posts.ts before adding a new query function.

Goal: Build real search using Postgres full-text search, plus a
dedicated dark-mode QA pass now that all pages exist.

Steps:
1. Add a searchPosts(query) function to src/lib/posts.ts using Supabase's
   textSearch() against title + dek + body_html (websearch_to_tsquery),
   restricted to status = 'published'.
2. Build src/app/api/search/route.ts calling searchPosts and returning
   up to 8 results as JSON.
3. Build src/components/layout/command-palette.tsx (shadcn
   `CommandDialog`), triggered by the header's search icon AND by ⌘K /
   Ctrl+K globally, calling the search API as the user types. Each
   result shows title + section + docket badge and navigates to the
   essay on select. Empty state: a short "no results" message.
4. Build src/app/search/page.tsx as a full-page equivalent for direct
   visits (e.g. a bookmarked URL).
5. Dark mode QA pass across every page/component from Phases 1-5:
   - No flash-of-wrong-theme on load (use next-themes'
     suppressHydrationWarning pattern).
   - Oxblood/brass accents swap correctly everywhere, not just the header.
   - The admin panel (Phase 3) should also respect dark mode, even
     though it's plainer — check it wasn't accidentally left light-only.

Verification:
- Search a word that appears in only one post's dek and confirm exactly
  that post surfaces.
- Toggle dark mode on the search page, the drawer, an essay page, and
  the admin post list — confirm no visual regressions anywhere.
- Confirm ⌘K works from every public page type.

If blocked: if Postgres full-text search ranking feels poor with only 8
sample posts, that's expected at this scale — don't over-engineer
ranking logic for a problem that only shows up with hundreds of posts.
```

### Phase 7 — Newsletter, RSS, SEO, deploy, handoff

```
Context: Phases 0-6 complete — final phase. Read the footer component
from Phase 1 before changing the subscribe form inside it.

Goal: Wire the stubbed newsletter endpoint, generate RSS, finish SEO,
and deploy to Vercel under the site owner's own accounts.

Steps:
1. Build src/app/api/subscribe/route.ts: accepts a POST with an email,
   validates it (zod), logs it and returns success for now — include a
   `// TODO: replace with <provider> API call once one is chosen`
   comment. Wire the footer's subscribe form to call this route and
   show a real success/error state.
2. Build src/app/rss.xml/route.ts generating a full-content RSS 2.0 feed
   from getPublishedPosts(), most recent first. Link it via <link
   rel="alternate" type="application/rss+xml"> in the root layout head.
3. Generate per-post OG images at
   src/app/essays/[slug]/opengraph-image.tsx using @vercel/og — docket
   number + title + section on the parchment/ink token colors. Add a
   default OG image for non-essay pages.
4. Add app/sitemap.ts covering all essay, section, and archive pages —
   explicitly EXCLUDE every /admin/* route.
5. Spot check generateMetadata across all page types from prior phases;
   fill in anything left default.
6. Deploy: connect the GitHub repo to a Vercel project created under
   the site owner's own email (not yours) — walk through this with me
   live rather than assuming credentials, since I can't create accounts
   on your behalf. Confirm the production build succeeds and give me
   the live URL.

Verification:
- Validate the RSS feed with an online RSS validator — no errors.
- Confirm OG images render for at least 2 different posts.
- Confirm /sitemap.xml contains no /admin URLs.
- Run Lighthouse against the deployed production URL (not localhost) for
  the home page and one essay page — report the 4 scores back directly.
- Confirm /admin/login still works on the deployed production URL, not
  just localhost — auth environment variables are a common thing to
  forget to set on Vercel.

If blocked: if the deploy fails due to missing Supabase environment
variables on Vercel, walk through exactly which ones are missing rather
than hardcoding fallback values into the code.
```

---

## 13. Notes for you

- **Placeholder content**: Phase 2 seeds 8 _original_ placeholder posts so the shell has something to look at — swap them for real writing (or delete them) once Phase 3's admin panel exists, by just logging in and using it like any other post.
- **Naming**: Site is branded "DaalBaatiChurma" by Pradyumn Singh Mephawat — all masthead text and metadata reflect this.
- **The non-technical guide**: once the site is live, ping me and I'll draft the actual one-page "how to add a post" handoff document referenced in Section 10 — it's a five-minute job once there are real screenshots to point to.
- **Scope check**: if Kimi K2.7 Code tries to add things not in a given phase's prompt (a second admin user, comments, a CMS-style page builder, etc.), redirect it back to the phase's stated goal.
- **Verification discipline**: every phase ends with concrete checks. If one fails, stop and fix before moving on — don't stack Phase 4 on top of a Phase 3 whose auth guard is silently broken.
