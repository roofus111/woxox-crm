import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LegalUiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  aiDrawerOpen: boolean;
  activeComplaintFilter: string;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setActiveComplaintFilter: (filter: string) => void;
}

export const useLegalUiStore = create<LegalUiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      aiDrawerOpen: false,
      activeComplaintFilter: "all",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
      setActiveComplaintFilter: (filter) => set({ activeComplaintFilter: filter }),
    }),
    { name: "legalos-ui", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) }
  )
);
