import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile ESM-only unified/rehype/remark packages so they work correctly
  // at runtime in both dev and production builds.
  transpilePackages: [
    "react-markdown",
    "remark-gfm",
    "rehype-raw",
    "unified",
    "bail",
    "is-plain-obj",
    "trough",
    "vfile",
    "unist-util-stringify-position",
    "mdast-util-from-markdown",
    "mdast-util-to-hast",
    "hast-util-raw",
    "hast-util-to-jsx-runtime",
  ],
  // async redirects() {
  //   return [
  //     {
  //       source: "/sessions/:path*",
  //       destination: "/app/:path*",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
