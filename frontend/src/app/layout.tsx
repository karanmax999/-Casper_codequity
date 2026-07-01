import type { ReactNode } from "react";

export const metadata = {
  title: "Codequity Launchpad",
  description: "AI-governed milestone funding on Casper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
