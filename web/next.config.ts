import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // vide en local ; mis à "/app" uniquement quand servi derrière le reverse
  // proxy ngrok (voir proxy/server.js), qui route /app vers ce serveur Next.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // next dev bloque par defaut les requetes cross-origin (protection anti
  // DNS-rebinding) ; sans ca, le JS ne s'hydrate pas derriere le tunnel ngrok
  // et les formulaires retombent sur une soumission navigateur classique.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app"],
};

export default nextConfig;
