import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles Next.js output itself; standalone is only needed by the Dockerfile.
  output: process.env.VERCEL ? undefined : 'standalone',
  /* config options here */
};

export default nextConfig;