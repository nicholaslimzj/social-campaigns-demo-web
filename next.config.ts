import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable polling for file changes when in dev mode
    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 1000,
        poll: 1000,
        ignored: ['node_modules', '.next']
      };
    }
    return config;
  }
};

export default nextConfig;
