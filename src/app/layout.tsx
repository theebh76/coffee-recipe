import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coffee Recipe — Hario Switch brew guides & timer",
  description:
    "Guided, step-by-step Hario Switch recipes with a brew timer that tells you what to pour and when.",
};

export const viewport: Viewport = {
  themeColor: "#fff1e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
