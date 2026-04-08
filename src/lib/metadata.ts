import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = "Qz - Study smarter. Know where you are. Never fall behind.",
  description = "AI-powered university study platform built around your syllabus.",
  image = "/api/og",
  noIndex = false,
}: MetadataProps = {}): Metadata {
  const baseUrl = "https://qz.bflabs.tech";
  const finalTitle = title.includes("Qz") ? title : `${title} | Qz`;

  return {
    title: finalTitle,
    description: description,
    openGraph: {
      title: finalTitle,
      description: description,
      url: baseUrl,
      siteName: "Qz Platform",
      images: [
        {
          url: image.startsWith("http") ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: description,
      images: [image.startsWith("http") ? image : `${baseUrl}${image}`],
      creator: "@bflabs",
    },
    metadataBase: new URL(baseUrl),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
