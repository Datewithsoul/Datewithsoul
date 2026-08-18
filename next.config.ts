import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles Next.js output itself; standalone is only needed by the Dockerfile.
  output: process.env.VERCEL ? undefined : 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;