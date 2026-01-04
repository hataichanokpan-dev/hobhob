import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HobHob - Habit Tracker",
  description: "Build better habits, one day at a time. A mobile-first habit tracker with stunning design.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HobHob",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden ios-fix">
        {/* Ambient glow background */}
        <div className="ambient-glow-subtle" />

        {/* Main content */}
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
