import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';
import { sectionLabel } from '@/lib/post-data';

export const runtime = 'edge';
export const alt = 'DaalBaatiChurma';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface OpenGraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf6ec',
          color: '#1c1f2b',
          fontFamily: 'Georgia, serif',
          fontSize: 64,
        }}
      >
        DaalBaatiChurma
      </div>,
      { ...size }
    );
  }

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 80,
        backgroundColor: '#faf6ec',
        color: '#1c1f2b',
        fontFamily: 'Georgia, serif',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 28,
          color: '#7a2e2e',
          fontWeight: 600,
        }}
      >
        <span>{post.docket_no}</span>
        <span style={{ color: '#a47b3d' }}>{sectionLabel(post.section)}</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 500,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {post.title}
        </h1>
        {post.dek && (
          <p
            style={{
              fontSize: 32,
              fontStyle: 'italic',
              color: '#5b5f6b',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {post.dek.replace(/<[^>]+>/g, '')}
          </p>
        )}
      </div>

      <div style={{ fontSize: 28, color: '#5b5f6b' }}>DaalBaatiChurma</div>
    </div>,
    { ...size }
  );
}
