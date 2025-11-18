import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['lh3.googleusercontent.com'],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/kampusconnect' : '',
};

export default nextConfig;
