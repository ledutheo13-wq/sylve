import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // La page /conseil a été retirée du site public. L'emplacement est
      // conservé pour une future page « parcours ». En attendant, les liens
      // existants atterrissent sur l'accueil plutôt que sur une 404.
      { source: "/conseil", destination: "/", statusCode: 301 },
    ];
  },
};

export default nextConfig;
