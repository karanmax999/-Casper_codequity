"use client";

import {
  BookOpenText,
  LayoutDashboard,
  RadioTower,
  SquarePlus,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  TerminalSquare,
  Building2,
  Users,
  Star,
  PlusCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/terminal/sidebar-context";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

function getActiveSection(pathname: string): string {
  if (pathname.startsWith("/docs")) return "docs";
  if (pathname.startsWith("/dashboard/profile")) return "profile";
  if (pathname.startsWith("/dashboard/admin/rounds/create")) return "create";
  if (pathname.startsWith("/dashboard/admin/investors")) return "admin-investors";
  if (pathname.startsWith("/dashboard/transactions")) return "transactions";
  if (pathname.startsWith("/dashboard/startups")) return "startups";
  if (pathname.startsWith("/dashboard/investors")) return "investors";
  if (pathname.startsWith("/dashboard/watchlist")) return "watchlist";
  if (pathname.startsWith("/dashboard/register-protocol")) return "register";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return "dashboard";
}

export function IconRail() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      return;
    }
    const client = supabase;

    async function fetchUser() {
      const { data } = await client.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    }
    fetchUser();
  }, []);

  const activeSection = getActiveSection(pathname);

  const isUserAdmin = isAdmin(userEmail);

  const adminNavItems = [
    { id: "dashboard", icon: LayoutDashboard, href: "/dashboard", label: "Dashboard" },
    { id: "create", icon: SquarePlus, href: "/dashboard/admin/rounds/create", label: "Create Round" },
    { id: "transactions", icon: RadioTower, href: "/dashboard/transactions", label: "Transactions" },
    { id: "admin-investors", icon: Users, href: "/dashboard/admin/investors", label: "Investors" },
    { id: "docs", icon: BookOpenText, href: "/docs", label: "Docs" },
  ];

  const clientNavItems = [
    { id: "dashboard", icon: LayoutDashboard, href: "/dashboard", label: "Dashboard" },
    { id: "startups", icon: Building2, href: "/dashboard/startups", label: "All Startups" },
    { id: "investors", icon: Users, href: "/dashboard/investors", label: "Investor Pipeline" },
    { id: "watchlist", icon: Star, href: "/dashboard/watchlist", label: "Watchlist" },
    { id: "register", icon: PlusCircle, href: "/dashboard/register-protocol", label: "Register Protocol" },
    { id: "docs", icon: BookOpenText, href: "/docs", label: "Docs" },
  ];

  const currentNavItems = isUserAdmin ? adminNavItems : clientNavItems;

  return (
    <aside
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 h-16 w-full border-t border-border bg-background/95 backdrop-blur md:relative md:inset-auto md:h-full md:border-r md:border-t-0 md:bg-background flex flex-row md:flex-col items-center py-2 md:py-4 px-3 md:px-0 gap-2 md:gap-4 shrink-0 transition-all duration-300 ease-in-out overflow-x-auto no-scrollbar",
        isCollapsed ? "md:w-16" : "md:w-64 md:px-4 md:items-start"
      )}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-3 md:pl-2"
        aria-label="Codequity Launchpad Home"
      >
        <TerminalSquare className="h-7 w-7 text-[#45f798] shrink-0" />
        {!isCollapsed && (
          <span className="font-bold text-white text-sm tracking-wide hidden md:inline">
            CodeQuity
          </span>
        )}
      </Link>

      <nav className={cn(
        "flex min-w-max flex-row items-center justify-center gap-1 flex-1 md:mt-4 md:min-w-0 md:flex-col",
        isCollapsed ? "" : "md:w-full"
      )}>
        {currentNavItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={cn(
                "flex items-center rounded-lg transition-all duration-200 shrink-0",
                isCollapsed
                  ? "justify-center w-10 h-10"
                  : "w-full py-2.5 px-3 gap-3",
                isActive
                  ? "bg-[#1F1F1F] text-[#45f798]"
                  : "text-muted-foreground hover:bg-[#1F1F1F] hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-xs font-medium hidden md:inline">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "flex shrink-0 flex-row md:flex-col items-center gap-1 md:mt-auto ml-auto md:ml-0",
        isCollapsed ? "" : "md:w-full"
      )}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className={cn(
            "flex items-center rounded-lg text-muted-foreground hover:bg-[#1F1F1F] hover:text-foreground transition-all duration-200",
            isCollapsed
              ? "justify-center w-10 h-10"
              : "w-full py-2.5 px-3 gap-3"
          )}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-[#45f798] shrink-0" />
          ) : (
            <PanelLeftClose className="h-5 w-5 shrink-0" />
          )}
          {!isCollapsed && (
            <span className="text-xs font-medium hidden md:inline">
              Collapse Sidebar
            </span>
          )}
        </button>

        {userEmail ? (
          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center border transition-all",
              activeSection === "profile"
                ? "border-[#45f798] text-[#45f798] bg-[#1F1F1F]"
                : "border-border text-foreground hover:border-[#45f798]",
              isCollapsed
                ? "justify-center w-8 h-8 rounded-full text-xs font-mono"
                : "w-full py-2 px-3 gap-3 rounded-md bg-[#1F1F1F]"
            )}
            title="View Profile"
          >
            {isCollapsed ? (
              userEmail.charAt(0).toUpperCase()
            ) : (
              <>
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white",
                  activeSection === "profile" ? "bg-[#45f798] text-black font-semibold" : "bg-[#2A2A2A]"
                )}>
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className={cn(
                  "text-xs font-mono truncate hidden md:inline",
                  activeSection === "profile" ? "text-[#45f798]" : "text-zinc-400"
                )}>
                  {userEmail.split("@")[0]}
                </span>
              </>
            )}
          </Link>
        ) : (
          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center border transition-all",
              activeSection === "profile"
                ? "border-[#45f798] text-[#45f798] bg-[#1F1F1F]"
                : "border-border text-muted-foreground hover:border-[#45f798] hover:text-foreground",
              isCollapsed
                ? "justify-center w-8 h-8 rounded-full"
                : "w-full py-2 px-3 gap-3 rounded-md bg-[#1F1F1F]"
            )}
            title="View Profile"
          >
            <User className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <span className={cn(
                "text-xs font-medium hidden md:inline",
                activeSection === "profile" ? "text-[#45f798]" : "text-muted-foreground"
              )}>
                Profile Settings
              </span>
            )}
          </Link>
        )}
      </div>
    </aside>
  );
}
