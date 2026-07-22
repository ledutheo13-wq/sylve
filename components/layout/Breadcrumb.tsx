"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  outilBySlug,
  familleById,
  familleBySlug,
} from "@/lib/tools-catalog";

// ═══════════════════════════════════════════════════════════
//  Fil d'Ariane — sylve · projet · [Famille] · [Outil]
//  Hiérarchie construite DEPUIS LE MANIFESTE (l'outil connaît sa
//  famille), pas depuis l'URL : les routes restent plates.
//  - Le slug courant sert uniquement à savoir « où suis-je ».
//  - Passez `slug` (page outil) ou `familleSlug` (page famille)
//    explicitement, sinon il est déduit de l'URL.
// ═══════════════════════════════════════════════════════════

interface Crumb {
  label: string;
  href?: string; // absent = niveau courant (non cliquable)
}

interface Props {
  slug?: string;
  familleSlug?: string;
}

export function Breadcrumb({ slug, familleSlug }: Props) {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean); // ["projet", "<x>"]
  const current = slug ?? familleSlug ?? seg[1] ?? "";

  // Ne rien afficher sur le hub /projet lui-même
  if (!current || pathname === "/projet") return null;

  const trail: Crumb[] = [
    { label: "sylve", href: "/" },
    { label: "projet", href: "/projet" },
  ];

  const outil = outilBySlug(current);
  if (outil) {
    const fam = familleById(outil.famille);
    if (fam) trail.push({ label: fam.nom, href: `/projet/${fam.slug}` });
    trail.push({ label: outil.nom });
  } else {
    const fam = familleBySlug(current);
    if (!fam) return null; // slug inconnu → pas de fil
    trail.push({ label: fam.nom });
  }

  return (
    <nav
      aria-label="Fil d'Ariane"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0.6rem 2rem",
        fontSize: "0.72rem",
        color: "var(--text-light)",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.35rem",
        alignItems: "center",
      }}
    >
      {trail.map((c, i) => (
        <span key={i} style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
          {i > 0 && <span aria-hidden style={{ opacity: 0.6 }}>·</span>}
          {c.href ? (
            <Link href={c.href} style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              {c.label}
            </Link>
          ) : (
            <span style={{ color: "var(--text)" }}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
