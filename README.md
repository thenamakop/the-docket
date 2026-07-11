# the-docket

A personal editorial blog for essays, book reviews, poetry, and personal writing. The public site displays published posts; the owner writes and publishes them through a private web admin panel at `/admin` — never by editing files in this repository.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public site.

## Content authoring

Posts are authored through the admin panel, not through Markdown or Git. After deployment, the site owner logs in at `yoursite.com/admin`, fills out the post form, and clicks **Publish**. New posts appear on the site automatically within about a minute.
