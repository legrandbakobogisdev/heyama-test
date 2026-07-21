import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // vide en local ; mis à "/app" uniquement quand servi derrière le reverse
  // proxy ngrok (voir proxy/server.js), qui route /app vers ce serveur Next.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
