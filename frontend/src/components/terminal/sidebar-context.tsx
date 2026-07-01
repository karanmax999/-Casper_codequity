"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

type SidebarContextT = {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  hoveredSection: string | null;
  setHoveredSection: (section: string | null) => void;
  wasCollapsedBeforeHover: boolean;
  setWasCollapsedBeforeHover: (val: boolean) => void;
  setIsHoveredRail: (val: boolean) => void;
  setIsHoveredDetail: (val: boolean) => void;
};

const SidebarContext = createContext<SidebarContextT>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  hoveredSection: null,
  setHoveredSection: () => {},
  wasCollapsedBeforeHover: false,
  setWasCollapsedBeforeHover: () => {},
  setIsHoveredRail: () => {},
  setIsHoveredDetail: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [wasCollapsedBeforeHover, setWasCollapsedBeforeHover] = useState(false);
  const [isHoveredRail, setIsHoveredRail] = useState(false);
  const [isHoveredDetail, setIsHoveredDetail] = useState(false);

  const handleSetCollapsed: Dispatch<SetStateAction<boolean>> = (value) => {
    setIsCollapsed((prev) => {
      const next = typeof value === "function" ? (value as (prevState: boolean) => boolean)(prev) : value;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  // Debounced mouse leave collapse/revert logic
  useEffect(() => {
    const isHoveredSidebar = isHoveredRail || isHoveredDetail;

    if (isHoveredSidebar) {
      return;
    }

    const timer = setTimeout(() => {
      setHoveredSection(null);
      if (wasCollapsedBeforeHover) {
        handleSetCollapsed(true);
        setWasCollapsedBeforeHover(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isHoveredRail, isHoveredDetail, wasCollapsedBeforeHover]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
        hoveredSection,
        setHoveredSection,
        wasCollapsedBeforeHover,
        setWasCollapsedBeforeHover,
        setIsHoveredRail,
        setIsHoveredDetail,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
