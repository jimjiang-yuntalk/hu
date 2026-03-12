import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase upload limits for /api/upload and Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
};

export default nextConfig;
