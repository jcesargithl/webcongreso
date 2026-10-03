import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.182",
    "10.78.123.6",
    "10.64.7.6",
    "localhost",
    "127.0.0.1",
    "192.168.1.46",
  ],
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
