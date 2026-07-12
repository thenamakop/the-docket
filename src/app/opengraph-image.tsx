import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'the-docket';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
      <div style={{ fontSize: 28, color: '#a47b3d', fontWeight: 600 }}>
        Essays, reviews, poetry, and personal writing
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1
          style={{
            fontSize: 96,
            fontWeight: 500,
            lineHeight: 1,
            margin: 0,
          }}
        >
          the-docket
        </h1>
        <p style={{ fontSize: 32, color: '#5b5f6b', margin: 0 }}>
          A personal editorial blog
        </p>
      </div>

      <div style={{ fontSize: 28, color: '#5b5f6b' }}>
        the-docket.vercel.app
      </div>
    </div>,
    { ...size }
  );
}
