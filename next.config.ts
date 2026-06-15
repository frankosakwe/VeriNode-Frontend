import type { NextConfig } from "next";

let nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Content-Type",
          value: "application/javascript; charset=utf-8",
        },
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
      ],
    },
    {
      source: "/icons/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

try {
  const withPWA = require("next-pwa");
  nextConfig = withPWA({
    dest: "public",
    runtimeCaching: [
      {
        urlPattern:
          /^https?:\/\/.*\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern:
          /^https?:\/\/.*\/api\/v1\/(nodes|attestations)\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 5,
        },
      },
    ],
  })(nextConfig);
} catch {
  console.info(
    "[next-pwa] not available — using manual service worker setup",
  );
}

export default nextConfig;
