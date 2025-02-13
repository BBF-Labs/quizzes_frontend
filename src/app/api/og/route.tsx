import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "40px",
          background:
            " linear-gradient(to right, rgb(16 180 120), rgb(90 130 246) 80%)",
        }}
      >
        {/* Logo at top right */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "12px 24px",
              borderRadius: "12px",
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "white",
              }}
            >
              BBF Labs
            </span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            marginTop: "-40px", // Adjust vertical centering
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.1,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            Master Your Learning Journey
          </h1>
        </div>

        {/* Stats at bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "900px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.1)",
            padding: "24px",
            borderRadius: "16px",
          }}
        >
          {[
            ["95%", "Success Rate"],
            ["24/7", "Access"],
            ["100+", "Quizzes"],
            ["5k+", "Students"],
          ].map(([number, label], index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                {number}
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
