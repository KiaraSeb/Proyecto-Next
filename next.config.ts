import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["books.google.com"], 
  },
};

export default nextConfig;
