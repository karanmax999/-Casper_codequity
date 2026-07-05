import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | CodeQuity Threshold Engine",
  description: "Learn how the CodeQuity Intelligence Layer translates raw technical traction and GitHub velocity into programmatic venture capital releases on the Casper Network.",
  openGraph: {
    title: "How CodeQuity Works | Programmatic Venture Capital",
    description: "Discover the deterministic process that converts technical traction into programmable capital. See how our smart contracts automate funding.",
    url: "https://launchpad.codequity.live/how-it-works",
  },
};

export default function HowItWorksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
