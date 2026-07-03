import { InvestorRegistrationForm } from "@/components/investor/InvestorRegistrationForm";
import { TerminalSquare } from "lucide-react";
import Link from "next/link";

export default function InvestorRegistrationPage() {
  return (
    <div className="min-h-screen bg-[#000000] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] text-accent mb-4 hover:border-accent/50 transition-colors">
            <TerminalSquare className="h-6 w-6 text-[#45f798]" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Become an Investor Partner</h1>
          <p className="mt-4 text-base text-zinc-400">
            Join the Codequity Launchpad ecosystem to access exclusive deal flow and automated milestone tracking.
          </p>
        </div>

        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-8 shadow-xl">
          <InvestorRegistrationForm />
        </div>
      </div>
    </div>
  );
}
