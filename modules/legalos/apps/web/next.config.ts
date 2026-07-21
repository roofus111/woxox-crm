import type { NextConfig } from "next";

const crmEmbedOrigins =
  process.env.LEGALOS_FRAME_ANCESTORS ||
  "http://localhost:3000 http://127.0.0.1:3000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: [],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow CRM shell to iframe LegalOS (X-Frame-Options DENY blocks embedding)
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${crmEmbedOrigins}`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
