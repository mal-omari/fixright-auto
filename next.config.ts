import type { NextConfig } from "next";
import { resolveLiveOperationsMode } from './lib/deployment-mode'

const liveOperationsEnabled = resolveLiveOperationsMode(
  process.env.NEXT_PUBLIC_APP_MODE,
  process.env.APP_MODE,
)

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

const nextConfig: NextConfig = {
  env: {
    // This immutable browser-visible value is derived from both requested modes.
    NEXT_PUBLIC_LIVE_OPERATIONS_ENABLED: liveOperationsEnabled ? 'true' : 'false',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
