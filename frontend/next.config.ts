import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional: configure React strict mode, i18n, etc.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;