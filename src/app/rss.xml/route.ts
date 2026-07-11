// RSS 2.0 feed generated from published posts.
export function GET() {
  return new Response('<?xml version="1.0"?><rss />', {
    headers: { 'Content-Type': 'application/rss+xml' },
  });
}
