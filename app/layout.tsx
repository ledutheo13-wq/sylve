import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "sylve — L'expertise et les outils du projet de paysage",
  description:
    "Outils numériques pensés par un paysagiste, pour les paysagistes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <body>
        {children}
        {process.env.NODE_ENV === "production" && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="c34f3cd3-7fce-4159-88c3-70ce00209d76"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
