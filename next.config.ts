import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles Next.js output itself; standalone is only needed by the Dockerfile.
  output: process.env.VERCEL ? undefined : 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;