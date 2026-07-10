import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  unreadNotificationsCount: number;
  activeTerm: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setUnreadNotificationsCount: (count: number) => void;
  setActiveTerm: (term: number) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  unreadNotificationsCount: 3,
  activeTerm: 1,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
  setActiveTerm: (term) => set({ activeTerm: term }),
}));
