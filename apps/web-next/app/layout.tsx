import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Datumart Digital Menu",
  description: "Restaurant menu powered by Datumart",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}