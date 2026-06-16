"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <Link href="/" className={styles.navLogo}>
        sylve
      </Link>
      <div className={styles.navRight}>
        <Link href="/conseil" className={styles.navLink}>
          conseil
        </Link>
        <Link href="/connexion" className={styles.navCta}>
          Accéder aux outils
        </Link>
      </div>
    </nav>
  );
}
