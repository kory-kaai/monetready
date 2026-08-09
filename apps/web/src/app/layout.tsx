import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monetready",
  description: "Turn raw ideas into revenue-ready products",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
