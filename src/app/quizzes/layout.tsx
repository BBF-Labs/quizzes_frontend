// import { Metadata } from "next";
// import axios from "axios";
// import Config from "@/config";

// const quizzesReq = await axios.get(`${Config.API_URL}/quizzes`);

// export async function generateMetadata(): Promise<Metadata> {
//   const quizzes = quizzesReq.data || "No quizzes available";
//   const title = "BBF Quizzes | Quizzes";
//   const description =
//     "Explore a variety of quizzes, carefully crafted by BBF Labs for students";

//   return {
//     title,
//     description,
//     openGraph: {
//       title,
//       description,
//       url: `${Config.SITE_URL}/quizzes`,
//       type: "website",
//       images: [
//         {
//           url: `${Config.SITE_URL}/api/og/quizzes`,
//           width: 800,
//           height: 600,
//           alt: "BBF Quizzes",
//         },
//       ],
//       siteName: "BBF Quizzes",
//       ...quizzes,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: [`${Config.SITE_URL}/api/quizzes`],
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
