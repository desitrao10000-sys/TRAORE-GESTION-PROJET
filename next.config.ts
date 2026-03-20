import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Désactiver certaines optimisations pour éviter les problèmes de cache
  experimental: {
    // Utiliser des paramètres pour stabiliser le dev server
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
