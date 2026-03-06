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

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: '#050a12',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
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
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(0, 110, 255, 0.1) 0%, transparent 70%)',
              filter: 'blur(50px)',
              borderRadius: '100%',
            }}
          />

          {/* Border Frame */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              right: '40px',
              bottom: '40px',
              border: '1px solid rgba(0, 110, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              justifyContent: 'space-between',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#006eff', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.2em' }}>
                SYSTEM://QZ.GENESIS
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#006eff', opacity: 0.5 }} />
                <div style={{ width: '8px', height: '8px', backgroundColor: '#006eff', opacity: 0.3 }} />
                <div style={{ width: '8px', height: '8px', backgroundColor: '#006eff', opacity: 0.1 }} />
              </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    border: '3px solid #006eff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 110, 255, 0.1)',
                  }}
                >
                  <div style={{ color: '#006eff', fontSize: '48px', fontWeight: '900' }}>Z</div>
                </div>
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  {title}
                </div>
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#94a3b8',
                  maxWidth: '700px',
                  lineHeight: '1.4',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                A high-frequency curriculum mastery platform for serious university students.
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>STATUS: STABLE_BUILD</div>
                <div style={{ color: '#006eff', fontSize: '10px' }}>[ SECURE CONNECTION ESTABLISHED ]</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ height: '1px', width: '100px', backgroundColor: 'rgba(0, 110, 255, 0.3)' }} />
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>QUZZES_V1.0</div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
