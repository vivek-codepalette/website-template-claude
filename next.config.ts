import type { NextConfig } from "next";

const PARENT_ORIGINS = [
  "http://localhost:3000",
  "https://www.preview.yast.ai",
  "https://www.yast.ai",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.yast.ai",
      },
    ],
  },
  async headers() {
    // You can return per-env if you want; keeping it simple here.
    const csp = `frame-ancestors ${PARENT_ORIGINS.join(" ")};`;

    return [
      {
        source: "/(.*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;