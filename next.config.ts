import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
