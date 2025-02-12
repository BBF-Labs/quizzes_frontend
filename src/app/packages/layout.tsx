// import { Metadata } from "next";
// import axios from "axios";
// import Config from "@/config";

// const packagesReq = await axios.get(`${Config.API_URL}/packages`);

// export async function generateMetadata(): Promise<Metadata> {
//   const packages = packagesReq.data || "No packages available at the moment";

//   const title = "BBF Quizzes | Packages";
//   const description =
//     "Get the best packages for your quizzes, carefully crafted by BBF Labs for students";

//   return {
//     title,
//     description,
//     openGraph: {
//       title,
//       description,
//       url: `${Config.SITE_URL}/packages`,
//       type: "website",
//       images: [
//         {
//           url: `${Config.SITE_URL}/api/og/packages`,
//           width: 800,
//           height: 600,
//           alt: "BBF Quizzes Packages",
//         },
//       ],
//       siteName: "BBF Quizzes",
//       ...packages,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: [`${Config.SITE_URL}/api/og/packages`],
//     },
//     robots: {
//       index: true,
//       follow: true,
//       googleBot: {
//         index: true,
//         follow: true,
//       },
//     },
//     authors: [
//       {
//         name: "Nii Tettey",
//         url: "https://www.theniitettey.live",
//       },
//       {
//         name: "BBF Labs Dev Team",
//         url: "https://www.bbflabs.theniitettey.live",
//       },
//     ],
//   };
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
