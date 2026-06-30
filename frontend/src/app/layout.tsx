import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codequity Launchpad",
  description: "AI-governed milestone funding on Casper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}