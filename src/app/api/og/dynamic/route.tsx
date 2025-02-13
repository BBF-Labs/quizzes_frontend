import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Get dynamic content from search params
  const title = searchParams.get("title") || "BBF Labs";
  const description =
    searchParams.get("description") || "Master Your Learning Journey";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 60px",
          background: "linear-gradient(135deg, #2DD4BF 0%, #1a4a5c 100%)",
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
              backdropFilter: "blur(10px)",
              padding: "12px 24px",
              borderRadius: "12px",
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "white",
              }}
            >
              BBF Labs
            </span>
          </div>
        </div>

        {/* Main content - aligned left */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.9)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        </div>

        {/* URL at bottom right */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            quizzes.theniitettey.live
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
