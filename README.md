<div align="center">

# the-docket

_An editorial blog with a private newsroom out back._

[![License: TBD](https://img.shields.io/badge/License-TBD-lightgrey)](<>)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?logo=next.js)](https://nextjs.org/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?logo=supabase)](https://supabase.com/)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthenamakop%2Fthe-docket.git)

</div>

## What is this

The Docket is a personal editorial blog for essays, book reviews, poetry, and personal writing. It is designed around one central idea: the person publishing posts should never have to touch this repository. Visitors see a clean, literary reading experience; the site owner sees a private, login-gated form at `/admin` where new essays are written, categorized, and published. Every post lives in a Supabase database, not in Git, so a new essay appears on the public site within about a minute of clicking Publish — no redeploy, no code review, no Markdown to remember.

## Table of contents

- [the-docket](#the-docket)
  - [What is this](#what-is-this)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [How content works](#how-content-works)
  - [Tech stack](#tech-stack)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [1. Clone and install](#1-clone-and-install)
    - [2. Environment variables](#2-environment-variables)
    - [3. Run the database schema](#3-run-the-database-schema)
    - [4. Start the dev server](#4-start-the-dev-server)
    - [Available scripts](#available-scripts)
  - [Project structure](#project-structure)
  - [Design system](#design-system)
  - [Deployment](#deployment)
  - [Roadmap](#roadmap)
  - [Publishing content](#publishing-content)
  - [License](#license)

## Features

- **Self-serve admin panel** — log in at `/admin`, write in a Tiptap rich-text editor, pick a section, and publish.
- **Featured essay homepage** — the most recent essay gets a full hero treatment, followed by a chronological volume index grouped by year.
- **Section browsing** — six editorial sections (Law & Justice, Criminal Justice, Book Reviews, Personal Essays, Poetry & Short Fiction, Guest Posts) with filtered index pages.
- **Archive by year** — essays organized by publication year instead of an endless flat list.
- **Full-text search** — Postgres `websearch_to_tsquery` across title, excerpt, and body, surfaced through a ⌘K command palette and a dedicated `/search` page.
- **Dark mode** — system preference on first load, manual toggle in the header, persisted afterwards.
- **RSS feed** — generated at request time from the same published-posts query as the homepage.
- **Open Graph images** — per-post OG images generated with `@vercel/og`, using docket number and title.

## How content works

This repository contains the design, routing, components, and infrastructure glue. The actual content — every post title, body, photo, and category — lives in a Supabase Postgres database and, for images, in a Supabase Storage bucket named `post-images`.

When you clone and run this repo locally, it will be empty until you point it at a real Supabase project. The schema lives in `supabase/schema.sql`. Running that SQL against a Supabase project creates the `posts` table, its Row Level Security policies, and the optional seed posts. After that, the site reads published posts automatically; the admin panel writes to the same table.

No Markdown files in this repo become blog posts. Content is authored entirely through `/admin` once the site is deployed.

## Tech stack

| Layer            | Choice                                                                                                              | Reason                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Framework        | [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)                       | App Router, server rendering, strong SEO, and direct database queries without a separate API. |
| Styling          | [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/) | Utility-first styling with CSS variables for the editorial design tokens.                     |
| Database         | [![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)](https://supabase.com/)           | Hosted Postgres with auth and storage in one free service.                                    |
| Auth             | Supabase Auth                                                                                                       | Single email/password account for the owner; no public signup flow.                           |
| File storage     | Supabase Storage                                                                                                    | Cover photos and inline post images.                                                          |
| Rich text editor | Tiptap                                                                                                              | WYSIWYG editing that feels like a stripped-down word processor, with no Markdown visible.     |
| Search           | Postgres full-text search                                                                                           | Built into Supabase; no extra search service needed.                                          |
| Components       | shadcn/ui primitives                                                                                                | Accessible dialog, sheet, command, input, select, textarea, button components.                |
| Icons            | lucide-react                                                                                                        | Consistent, accessible icon set.                                                              |
| OG images        | @vercel/og                                                                                                          | Generate share cards at request time.                                                         |
| Deployment       | [![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)](https://vercel.com/)                             | Zero-config Next.js hosting on the free tier.                                                 |

Pages render with `export const revalidate = 60`, so published posts propagate across the site automatically within about a minute.

## Getting started

### Prerequisites

- **Node.js** 18.17 or later (the version required by Next.js 16). The project uses **npm** (`package-lock.json` is committed).
- A **Supabase** project (free tier is sufficient).

### 1. Clone and install

```bash
git clone https://github.com/thenamakop/the-docket.git
cd the-docket
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> `.env.local.example` is added during the Supabase setup phase (Phase 2). Until then, create `.env.local` manually with the two keys above.

### 3. Run the database schema

Open `supabase/schema.sql` in your Supabase project's SQL Editor and run it. This creates the `posts` table, Row Level Security policies, and optional seed posts.

### 4. Start the dev server

```bash
npm run dev
```

Open the public site at [http://localhost:3000](http://localhost:3000) and the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

### Available scripts

| Script          | Purpose                        |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the development server   |
| `npm run build` | Build the production app       |
| `npm run start` | Start the production server    |
| `npm run lint`  | Run ESLint across the codebase |

## Project structure

<details>
<summary>Click to expand the current repo tree</summary>

```
.
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AGENTS.md
├── CLAUDE.md
├── PROGRESS.md
├── README.md
├── SPEC.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── posts/
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               └── page.tsx
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   └── subscribe/
│   │   │       └── route.ts
│   │   ├── archive/
│   │   │   └── [year]/
│   │   │       └── page.tsx
│   │   ├── essays/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── rss.xml/
│   │   │   └── route.ts
│   │   ├── search/
│   │   │   └── page.tsx
│   │   └── section/
│   │       └── [section]/
│   │           └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── image-uploader.tsx
│   │   │   ├── post-form.tsx
│   │   │   └── rich-text-editor.tsx
│   │   ├── layout/
│   │   │   ├── command-palette.tsx
│   │   │   ├── filter-drawer.tsx
│   │   │   ├── footer.tsx
│   │   │   └── header.tsx
│   │   ├── post/
│   │   │   ├── docket-badge.tsx
│   │   │   ├── post-card.tsx
│   │   │   └── related-posts.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── command.tsx
│   │       ├── dialog.tsx
│   │       ├── input-group.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       └── textarea.tsx
│   └── lib/
│       ├── posts.ts
│       ├── reading-time.ts
│       ├── utils.ts
│       └── supabase/
│           ├── client.ts
│           ├── middleware.ts
│           └── server.ts
└── supabase/
    └── schema.sql
```

</details>

## Design system

The public site is styled as a quiet, literary/legal journal. The full rationale is in `SPEC.md` Section 3.

**Color tokens (light mode)**

| Token             | Hex       | Use                                                   |
| ----------------- | --------- | ----------------------------------------------------- |
| `--ink`           | `#1C1F2B` | Primary text                                          |
| `--parchment`     | `#FAF6EC` | Page background                                       |
| `--parchment-dim` | `#F1E9D8` | Card/panel surfaces                                   |
| `--oxblood`       | `#7A2E2E` | Primary accent — links, docket numbers, active states |
| `--brass`         | `#A47B3D` | Secondary accent — hover underline, category badges   |
| `--slate`         | `#5B5F6B` | Meta text — dates, bylines, captions                  |
| `--rule`          | `#DCD2BC` | Hairline dividers                                     |

Dark mode flips these to a deeper palette; see `SPEC.md` for the exact dark overrides.

**Type roles**

| Role         | Font          | Use                                 |
| ------------ | ------------- | ----------------------------------- |
| Display      | Fraunces      | Masthead, post titles, pull-quotes  |
| Body         | Newsreader    | Essay body text                     |
| UI           | Public Sans   | Navigation, buttons, category tags  |
| Mono/utility | IBM Plex Mono | Docket numbers, dates, reading time |

## Deployment

Everything runs on free tiers unless you add a custom domain.

1. Create a **Supabase** project and run `supabase/schema.sql` in the SQL Editor.
2. Create a single auth user in Supabase for the site owner.
3. Click the **Deploy to Vercel** button at the top of this README, or create a Vercel project from this GitHub repo.
4. Add the two environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Vercel builds and deploys on every push to `main`.
6. Optional: add a custom domain (the only paid item, roughly $10–15/year).

For the handoff, ownership of the Vercel and Supabase projects should sit with the site owner, and the admin password should be shared directly — never over plain email or chat.

## Roadmap

The live source of truth for build status is [`PROGRESS.md`](./PROGRESS.md). This list is a quick-glance summary.

- [x] Phase 0 — Repo bootstrap
- [x] Phase 1 — Design tokens + layout shell
- [x] Phase 2 — Supabase setup + home page
- [x] Phase 3 — Admin panel
- [x] Phase 4 — Post detail page
- [x] Phase 5 — Section / archive pages + filter drawer
- [ ] Phase 6 — Search + dark mode polish
- [ ] Phase 7 — Newsletter, RSS, SEO, deploy, handoff

## Publishing content

Content is published by logging into `/admin` and using the post form. The non-technical guide for the site owner lives in `HOW-TO-POST.md` (added later).

<!-- TODO: add screenshot once Phase 4 UI exists -->

## License

License: TBD. No `LICENSE` file exists in this repository yet.
