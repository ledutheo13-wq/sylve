export function Badge({
  variant = "beta",
  children,
}: {
  variant?: "beta" | "soon";
  children: React.ReactNode;
}) {
  const styles: React.CSSProperties =
    variant === "beta"
      ? {
          background: "var(--sylve-light)",
          color: "var(--primary)",
          border: "1px solid var(--primary)",
        }
      : {
          background: "var(--fond-warm)",
          color: "var(--text-light)",
          border: "1px solid var(--border)",
        };

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 4,
        ...styles,
      }}
    >
      {children}
    </span>
  );
}
