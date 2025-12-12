import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pokeapi.co",
      },
      {
        protocol: "https",
        hostname: "cdn2.bulbagarden.net",
      },
    ],
  },
};

export default nextConfig;
