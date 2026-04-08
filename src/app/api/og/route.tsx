import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic parameters from query string
    const title = searchParams.get('title') || 'BETAFORGE LABS';
    const description = searchParams.get('description') || 'Study Smarter. Know your rank. Master it all.';
    const subtitle = searchParams.get('subtitle') || 'WAITLIST NOW OPEN';
    const type = searchParams.get('type') || 'page';

    const { origin } = new URL(request.url);
    const logoUrl = `${origin}/logo.png`;

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: '#050a12',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Grid */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              opacity: 0.4,
            }}
          />

          {/* Large Glow Effect */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1000px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(0, 110, 255, 0.08) 0%, transparent 70%)',
              borderRadius: '100%',
            }}
          />

          {/* Main Content Area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              padding: '80px',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            {/* Badge / Subtitle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(0, 110, 255, 0.3)',
                backgroundColor: 'rgba(0, 110, 255, 0.05)',
                padding: '8px 16px',
                marginBottom: '40px',
                alignSelf: 'flex-start',
              }}
            >
              <div style={{ width: '6px', height: '6px', backgroundColor: '#006eff' }} />
              <div style={{ color: '#006eff', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {subtitle}
              </div>
            </div>

            {/* Title Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  width="60"
                  height="60"
                  style={{ objectFit: 'contain', marginTop: '10px' }}
                />
                <div
                  style={{
                    fontSize: title.length > 20 ? '70px' : '96px',
                    fontWeight: '900',
                    color: '#ffffff',
                    lineHeight: 1.0,
                    letterSpacing: '-0.04em',
                    maxWidth: '900px',
                  }}
                >
                  {title}
                </div>
              </div>

              <div
                style={{
                  fontSize: '32px',
                  color: '#94a3b8',
                  maxWidth: '800px',
                  lineHeight: '1.4',
                  fontWeight: '300',
                  marginTop: '16px',
                  marginLeft: '84px',
                }}
              >
                {description}
              </div>
            </div>

            {/* Platform Branding */}
            <div
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '164px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '20px', height: '1px', backgroundColor: '#006eff' }} />
              <div style={{ color: '#475569', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                QZ STUDY PLATFORM | BFLABS.TECH
              </div>
            </div>
          </div>

          {/* Decorative Corner Blobs */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(0, 110, 255, 0.05) 0%, transparent 70%)',
              borderRadius: '100%',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
