// import { Metadata } from "next";

// export function generateMetadata(): Metadata {
//   const title = "BBF Quizzes | Login Or Sign Up";
//   const description = "Login or sign up to access BBF Quizzes";
//   return {
//     title,
//     description,
//     openGraph: {
//       type: "website",
//       title,
//       description,
//       url: "https://quizzess.theniitettey.live/login",
//       images: [
//         {
//           url: "/api/og/auth",
//           width: 1200,
//           height: 630,
//           alt: "BBF Quizzes | Login Or Sign Up",
//         },
//       ],
//       siteName: "BBF Quizzes",
//     },

//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       creator: "@theniitettey",
//       images: ["/api/og/auth"],
//     },

//     alternates: {
//       canonical: "https://quizzess.theniitettey.live/login",
//     },

//     robots: {
//       index: true,
//       follow: true,
//       googleBot: {
//         index: true,
//         follow: true,
//         "max-video-preview": -1,
//         "max-image-preview": "large",
//         "max-snippet": -1,
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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
