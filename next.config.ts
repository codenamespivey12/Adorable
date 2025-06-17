import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    viewTransition: true,
  },
  devIndicators: false,
  webpack(config, { isServer }) {
    // Skip optional Cloudflare sockets imports used by pg-cloudflare.
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('cloudflare:sockets');
    }
    
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'cloudflare:sockets': false,
    };
    
    return config;
  },
};

export default nextConfig;
