import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monetready",
  description: "Turn raw ideas into revenue-ready products",
};

export const viewport: Viewport = {
  themeColor: "#030405",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
