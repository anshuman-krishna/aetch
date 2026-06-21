import { ImageResponse } from 'next/og';

// generated social share image — fixes the previously missing og:image
export const alt = 'AETCH — The Tattoo Creative Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: 10 }}>AETCH</div>
        <div style={{ fontSize: 38, marginTop: 8, opacity: 0.92 }}>
          The Tattoo Creative Platform
        </div>
      </div>
    ),
    { ...size },
  );
}
