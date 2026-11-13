import type { NextConfig } from "next";

// Fotos de los productos (HU-05): <Image> de Next solo optimiza fotos de sitios autorizados.
// Autorizamos únicamente la carpeta pública del bucket fotos-productos de nuestro Supabase.
// La dirección sale de la variable de entorno (en Vercel se configura en el panel).
const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const fotosProductos = urlSupabase
  ? [new URL(`${urlSupabase}/storage/v1/object/public/fotos-productos/**`)]
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: fotosProductos,
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
