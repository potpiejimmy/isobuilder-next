import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
//  assetPrefix: './', /* allows opening the app from file system, but confuses dev server, activate on build only */
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
