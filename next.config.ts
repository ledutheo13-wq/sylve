import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // La page /conseil a été retirée du site public. L'emplacement est
      // conservé pour une future page « parcours ». En attendant, les liens
      // existants atterrissent sur l'accueil plutôt que sur une 404.
      //
      // Redirection TEMPORAIRE volontairement : la route sera réutilisée. Une
      // redirection permanente resterait en cache dans les navigateurs qui
      // l'ont vue et les empêcherait d'atteindre la future page.
      { source: "/conseil", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
