import { getPublishedPosts, sectionLabel } from '@/lib/posts';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://daalbaatichurma.vercel.app';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  const posts = await getPublishedPosts(100);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/essays/${post.slug}`;
      const pubDate = new Date(post.published_at).toUTCString();
      const description = escapeXml(stripHtml(post.dek ?? ''));

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(sectionLabel(post.section))}</category>
      <description>${description}</description>
      <content:encoded><![CDATA[${post.body_html ?? ''}]]></content:encoded>
    </item>`;
    })
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss-styles.xsl"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>DaalBaatiChurma</title>
    <link>${SITE_URL}</link>
    <description>A personal editorial blog for essays, reviews, poetry, and personal writing.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
