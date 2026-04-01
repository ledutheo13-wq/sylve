import Link from "next/link";

export function Logo({
  href = "/",
  sub,
}: {
  href?: string;
  sub?: string;
}) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 300,
          fontSize: 18,
          letterSpacing: 8,
          color: "var(--primary)",
        }}
      >
        sylve
      </span>
      {sub && (
        <span
          style={{
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 300,
            fontSize: 13,
            letterSpacing: 3,
            color: "var(--text-muted)",
          }}
        >
          {sub}
        </span>
      )}
    </Link>
  );
}
