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
    serverComponentsExternalPackages: ["pg", "pg-cloudflare"],
  },
  devIndicators: {
    appIsrStatus: false,
  },
  webpack: (config, { isServer }) => {
    // Handle cloudflare:sockets import issue
    config.resolve.alias = {
      ...config.resolve.alias,
      "cloudflare:sockets": false,
    };
    
    // Externalize problematic packages for server builds
    if (isServer) {
      config.externals = [...config.externals, "pg-native", "cloudflare:sockets"];
    }
    
    return config;
  },
};

export default nextConfig;
