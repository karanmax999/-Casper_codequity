"use client";

import {
  LayoutDashboard,
  SquarePlus,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  TerminalSquare,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/terminal/sidebar-context";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  id: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, href: "/dashboard", label: "Dashboard" },
  { id: "create", icon: SquarePlus, href: "/dashboard/admin/rounds/create", label: "Create Round" },
];

function getActiveSection(pathname: string): string {
  if (pathname.startsWith("/dashboard/admin/rounds/create")) return "create";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return "dashboard";
}

export function IconRail() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const {
    isCollapsed,
    setIsCollapsed,
    setHoveredSection,
    setWasCollapsedBeforeHover,
    setIsHoveredRail,
  } = useSidebar();

  useEffect(() => {
    const supabase = createClient();
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    }
    fetchUser();
  }, []);

  const handleMouseEnterIcon = (section: string) => {
    if (isCollapsed) {
      setWasCollapsedBeforeHover(true);
      setIsCollapsed(false);
    }
    setHoveredSection(section);
  };

  const activeSection = getActiveSection(pathname);

  return (
    <aside
      onMouseEnter={() => setIsHoveredRail(true)}
      onMouseLeave={() => setIsHoveredRail(false)}
      className="fixed inset-x-0 bottom-0 z-40 h-16 w-full border-t border-border bg-background/95 backdrop-blur md:relative md:inset-auto md:h-full md:w-16 md:border-r md:border-t-0 md:bg-background flex flex-row md:flex-col items-center py-2 md:py-4 px-3 md:px-0 gap-2 md:gap-4 shrink-0 overflow-x-auto no-scrollbar"
    >
      <Link
        href="/dashboard"
        className="flex items-center justify-center"
        aria-label="Codequity Launchpad Home"
        onMouseEnter={() => handleMouseEnterIcon("dashboard")}
      >
        <TerminalSquare className="h-7 w-7 text-[#45f798]" />
      </Link>

      <nav className="flex min-w-max flex-row items-center justify-center gap-1 flex-1 md:mt-4 md:min-w-0 md:flex-col">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              onMouseEnter={() => handleMouseEnterIcon(item.id)}
              className={cn(
                "flex items-center justify-center w-10 h-10 shrink-0 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-[#1F1F1F] text-[#45f798]"
                  : "text-muted-foreground hover:bg-[#1F1F1F] hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 flex-row md:flex-col items-center gap-1 md:mt-auto ml-auto md:ml-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={() => setIsCollapsed(false)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-[#1F1F1F] hover:text-foreground transition-colors duration-200"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-[#45f798]" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {userEmail ? (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1F1F1F] border border-border text-xs font-mono text-foreground cursor-pointer"
            title={userEmail}
            onMouseEnter={() => handleMouseEnterIcon("settings")}
          >
            {userEmail.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1F1F1F] border border-border text-muted-foreground cursor-pointer"
            onMouseEnter={() => handleMouseEnterIcon("settings")}
          >
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  );
}
