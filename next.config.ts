// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'star-graph.oss-cn-beijing.aliyuncs.com',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;