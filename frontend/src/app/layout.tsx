import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://launchpad.codequity.live"),
  title: {
    default: "CodeQuity | Disruptive Milestone-Backed Capital on Casper",
    template: "%s | CodeQuity",
  },
  description: "The definitive Threshold Release Engine for Web3. Secure automated funding based on real technical traction and GitHub velocity, without the VC bias.",
  keywords: ["Milestone-backed capital", "Threshold release engine", "Programmatic venture capital", "Casper network smart contracts", "Proof-of-traction escrow", "CodeQuity"],
  openGraph: {
    title: "CodeQuity | Programmatic Venture Capital on Casper",
    description: "Secure automated funding based on real technical traction, GitHub velocity, and AI governance. Bypass the VC echo chamber.",
    url: "https://launchpad.codequity.live",
    siteName: "CodeQuity Launchpad",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "CodeQuity Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeQuity | Disruptive Milestone-Backed Capital",
    description: "Secure automated funding based on real technical traction. Code is truth.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://launchpad.codequity.live/#organization",
      "name": "CodeQuity",
      "url": "https://launchpad.codequity.live",
      "logo": "https://launchpad.codequity.live/logo.png",
      "sameAs": []
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://launchpad.codequity.live/#software",
      "name": "CodeQuity Threshold Release Engine",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web, Casper Network",
      "description": "An AI-governed funding platform utilizing smart contracts on the Casper Network to release capital based on GitHub velocity and on-chain milestones."
    },
    {
      "@type": "FinancialService",
      "@id": "https://launchpad.codequity.live/#financialservice",
      "name": "CodeQuity Milestone-Backed Capital",
      "description": "Programmatic venture capital and escrow release management for Web3 startups.",
      "provider": {
        "@id": "https://launchpad.codequity.live/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
