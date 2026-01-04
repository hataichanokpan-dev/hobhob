import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "HobHob - Habit Tracker",
  description: "Build better habits, one day at a time.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/hobhob_v2.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/hobhob_v2.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
  themeColor: "#fbfbf7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden ios-fix">
        <ThemeProvider>
          <AuthProvider>
            <div className="ambient-glow-subtle" />
            <div className="relative min-h-screen">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
