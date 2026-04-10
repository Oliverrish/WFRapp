"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface SidebarContextType {
  isMobile: boolean;
  isCollapsed: boolean;
  isOpen: boolean;
  hideChrome: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setHideChrome: (hide: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isMobile: false,
  isCollapsed: false,
  isOpen: false,
  hideChrome: false,
  toggle: () => {},
  open: () => {},
  close: () => {},
  setHideChrome: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hideChrome, setHideChrome] = useState(false);

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsCollapsed(width >= 768 && width < 1024);
    };

    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  const toggle = useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        isCollapsed,
        isOpen,
        hideChrome,
        toggle,
        open,
        close,
        setHideChrome,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
