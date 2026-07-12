<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  exclude-result-prefixes="content">

  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="/rss/channel/title" /> — RSS Feed</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400&amp;family=Newsreader:ital,wght@0,400;1,400&amp;family=Public+Sans:wght@400;500&amp;display=swap" rel="stylesheet" />
        <style>
          /* Design tokens matching the site */
          :root {
            --ink:          #1c1f2b;
            --parchment:    #faf6ec;
            --parchment-dim:#f1e9d8;
            --oxblood:      #7a2e2e;
            --brass:        #a47b3d;
            --slate:        #5b5f6b;
            --rule:         #dcd2bc;
            --font-display: 'Fraunces', Georgia, serif;
            --font-body:    'Newsreader', Georgia, serif;
            --font-ui:      'Public Sans', system-ui, sans-serif;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --ink:          #ede7d8;
              --parchment:    #15141b;
              --parchment-dim:#1e1c26;
              --oxblood:      #c4645f;
              --brass:        #c9a063;
              --slate:        #9b97a8;
              --rule:         #2c2a35;
            }
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: var(--font-ui);
            background: var(--parchment);
            color: var(--ink);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }

          a {
            color: var(--oxblood);
            text-decoration: underline;
            text-underline-offset: 0.15em;
          }
          a:hover { text-decoration-thickness: 2px; }

          /* ── Page shell ── */
          .page {
            max-width: 56rem;
            margin: 0 auto;
            padding: 3rem 1.25rem 6rem;
          }

          /* ── Header ── */
          .feed-header {
            border-bottom: 1px solid var(--rule);
            padding-bottom: 2rem;
            margin-bottom: 2.5rem;
          }

          .feed-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-family: var(--font-ui);
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--brass);
            margin-bottom: 0.75rem;
          }

          /* RSS icon inline SVG */
          .rss-icon {
            width: 0.85rem;
            height: 0.85rem;
            fill: var(--brass);
            flex-shrink: 0;
          }

          .feed-title {
            font-family: var(--font-display);
            font-size: clamp(1.75rem, 4vw, 2.5rem);
            font-weight: 500;
            letter-spacing: -0.01em;
            line-height: 1.15;
            color: var(--ink);
          }

          .feed-title a {
            color: inherit;
            text-decoration: none;
          }
          .feed-title a:hover { color: var(--oxblood); }

          .feed-description {
            margin-top: 0.6rem;
            font-family: var(--font-body);
            font-size: 1.0625rem;
            color: var(--slate);
            font-style: italic;
          }

          .feed-meta {
            margin-top: 1.25rem;
            font-family: var(--font-ui);
            font-size: 0.8125rem;
            color: var(--slate);
          }

          .feed-meta a {
            color: var(--oxblood);
          }

          /* ── Item list ── */
          .item-list {
            display: flex;
            flex-direction: column;
            gap: 0;
          }

          .item {
            border-bottom: 1px solid var(--rule);
            padding: 1.75rem 0;
          }
          .item:first-child { padding-top: 0; }

          .item-meta {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-wrap: wrap;
            margin-bottom: 0.5rem;
          }

          .item-date {
            font-family: var(--font-ui);
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.04em;
            color: var(--slate);
            font-variant-numeric: tabular-nums;
          }

          .item-sep {
            color: var(--rule);
            font-size: 0.75rem;
          }

          .item-category {
            font-family: var(--font-ui);
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--brass);
          }

          .item-title {
            font-family: var(--font-display);
            font-size: clamp(1.125rem, 2vw, 1.375rem);
            font-weight: 500;
            line-height: 1.3;
            margin-bottom: 0.5rem;
          }

          .item-title a {
            color: var(--ink);
            text-decoration: none;
          }
          .item-title a:hover { color: var(--oxblood); }

          .item-description {
            font-family: var(--font-body);
            font-size: 1rem;
            line-height: 1.6;
            color: var(--slate);
            max-width: 62ch;
          }

          .item-read-link {
            display: inline-block;
            margin-top: 0.75rem;
            font-family: var(--font-ui);
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--oxblood);
            text-decoration: none;
            letter-spacing: 0.02em;
          }
          .item-read-link:hover { text-decoration: underline; text-underline-offset: 0.15em; }

          /* ── Empty state ── */
          .empty {
            padding: 3rem 0;
            font-family: var(--font-body);
            font-size: 1.0625rem;
            font-style: italic;
            color: var(--slate);
          }

          /* ── Footer ── */
          .feed-footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--rule);
            font-family: var(--font-ui);
            font-size: 0.8rem;
            color: var(--slate);
          }
        </style>
      </head>

      <body>
        <div class="page">

          <!-- Header -->
          <header class="feed-header">
            <div class="feed-badge">
              <!-- RSS icon -->
              <svg class="rss-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
              </svg>
              RSS Feed
            </div>

            <h1 class="feed-title">
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="/rss/channel/link" />
                </xsl:attribute>
                <xsl:value-of select="/rss/channel/title" />
              </a>
            </h1>

            <p class="feed-description">
              <xsl:value-of select="/rss/channel/description" />
            </p>

            <p class="feed-meta">
              Subscribe in your feed reader by copying the URL from the address bar, or
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="/rss/channel/link" />
                </xsl:attribute>
                visit the site
              </a>.
            </p>
          </header>

          <!-- Item list -->
          <xsl:choose>
            <xsl:when test="/rss/channel/item">
              <ol class="item-list">
                <xsl:apply-templates select="/rss/channel/item" />
              </ol>
            </xsl:when>
            <xsl:otherwise>
              <p class="empty">No posts published yet — check back soon.</p>
            </xsl:otherwise>
          </xsl:choose>

          <!-- Footer -->
          <footer class="feed-footer">
            This is a valid RSS 2.0 feed. Paste the URL into any feed reader to subscribe.
          </footer>

        </div>
      </body>
    </html>
  </xsl:template>

  <!-- ── Item template ── -->
  <xsl:template match="item">
    <!-- Format the pubDate: strip the time, keep "DD Mon YYYY" -->
    <xsl:variable name="rawDate" select="pubDate" />

    <li class="item">
      <div class="item-meta">
        <span class="item-date">
          <xsl:value-of select="pubDate" />
        </span>
        <xsl:if test="category != ''">
          <span class="item-sep" aria-hidden="true">·</span>
          <span class="item-category">
            <xsl:value-of select="category" />
          </span>
        </xsl:if>
      </div>

      <h2 class="item-title">
        <a>
          <xsl:attribute name="href">
            <xsl:value-of select="link" />
          </xsl:attribute>
          <xsl:value-of select="title" />
        </a>
      </h2>

      <xsl:if test="description != ''">
        <p class="item-description">
          <xsl:value-of select="description" />
        </p>
      </xsl:if>

      <a class="item-read-link">
        <xsl:attribute name="href">
          <xsl:value-of select="link" />
        </xsl:attribute>
        Read essay →
      </a>
    </li>
  </xsl:template>

</xsl:stylesheet>
