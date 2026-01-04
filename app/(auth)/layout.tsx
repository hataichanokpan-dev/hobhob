import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Ambient glow background */}
      <div className="ambient-glow" />
      {children}
    </div>
  );
}
