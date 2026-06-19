import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/rooms/lobby',
        destination: '/salas',
        permanent: true,
      },
      {
        source: '/rooms',
        destination: '/salas',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
