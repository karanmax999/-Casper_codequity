import { IconRail } from "@/components/terminal/icon-rail";
import { Providers } from "@/components/providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="relative flex min-h-dvh flex-col-reverse overflow-hidden md:h-screen md:flex-row">
        <IconRail />
        <main className="flex min-h-0 flex-1 overflow-hidden">
          <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
              {children}
            </div>
          </section>
        </main>
      </div>
    </Providers>
  );
}
