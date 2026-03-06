import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic title from query params
    const hasTitle = searchParams.has('title');
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'BETAFORGE LABS';

    const { origin } = new URL(request.url);
    const logoUrl = `${origin}/logo.png`;
    const studentsUrl = `${origin}/students.png`;

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

          {/* Glow Effect */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(0, 110, 255, 0.15) 0%, transparent 70%)',
              borderRadius: '100%',
            }}
          />

          {/* Left Column - Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '60%',
              height: '100%',
              padding: '60px 0 60px 60px',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            {/* Waitlist Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(0, 110, 255, 0.4)',
                backgroundColor: 'rgba(0, 110, 255, 0.1)',
                padding: '6px 12px',
                marginBottom: '32px',
              }}
            >
              <div style={{ width: '6px', height: '6px', backgroundColor: '#006eff' }} />
              <div style={{ color: '#006eff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.15em' }}>
                WAITLIST NOW OPEN
              </div>
            </div>

            {/* Logo and Title Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  width="48"
                  height="48"
                  style={{ objectFit: 'contain' }}
                />
                <div
                  style={{
                    fontSize: '80px',
                    fontWeight: '900',
                    color: '#ffffff',
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ color: '#006eff' }}>{title}</span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  maxWidth: '500px',
                  lineHeight: '1.4',
                  fontWeight: '300',
                  marginTop: '12px',
                }}
              >
                Study Smarter. Know your rank. Master it all.
              </div>
            </div>

            {/* Stats / Features */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '48px', borderLeft: '2px solid #006eff', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>100%</div>
                <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.1em' }}>CURRICULUM SYNC</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>REAL-TIME</div>
                <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.1em' }}>AI INSIGHTS</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div
            style={{
              display: 'flex',
              width: '40%',
              height: '100%',
              position: 'relative',
            }}
          >
            <img
              src={studentsUrl}
              alt="Students"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                maskImage: 'linear-gradient(to right, transparent, black 20%)',
              }}
            />
          </div>

          {/* Decorative Corner Element */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              display: 'flex',
              gap: '4px',
            }}
          >
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006eff', opacity: 0.5 }} />
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006eff', opacity: 0.3 }} />
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006eff', opacity: 0.1 }} />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
