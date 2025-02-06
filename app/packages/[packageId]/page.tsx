import type { Metadata } from "next"
import PackageDetails from "@/components/PackageDetails"

interface PackagePageProps {
  params: { packageId: string }
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  // Fetch package details from API
  const package = await fetch(`https://bbf-backend.onrender.com/api/packages/${params.packageId}`).then((res) =>
    res.json(),
  )

  return {
    title: `${package.name} - BBF Labs Package`,
    description: package.description,
    openGraph: {
      title: `${package.name} - BBF Labs Package`,
      description: package.description,
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=package&title=${encodeURIComponent(package.name)}&description=${encodeURIComponent(package.description)}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

export default function PackagePage({ params }: PackagePageProps) {
  return <PackageDetails packageId={params.packageId} />
}

