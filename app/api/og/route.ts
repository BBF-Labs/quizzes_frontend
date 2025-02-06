import { ImageResponse } from "@vercel/og"
import type { NextRequest } from "next/server"

export const config = {
  runtime: "edge",
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const title = searchParams.get("title")
  const description = searchParams.get("description")

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f5",
        fontSize: 32,
        fontWeight: 600,
      }}
    >
      <div style={{ marginBottom: 24, color: "#18181b" }}>
        {type === "package" ? "BBF Labs Package" : "BBF Labs Quiz"}
      </div>
      <div style={{ marginBottom: 24, color: "#3f3f46" }}>{title}</div>
      <div style={{ fontSize: 24, color: "#71717a" }}>{description}</div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}

