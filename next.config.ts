// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 设置端口号
    env: {
        PORT: '3001'
    },
    // 或者使用这种方式设置端口
    experimental: {
        serverComponentsExternalPackages: []
    },
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