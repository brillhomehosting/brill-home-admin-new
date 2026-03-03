import { createContext } from 'react';

export type SidebarContextValue = {
  open: boolean;
  toggle: () => void;
  openSidebar: () => void;
};

/**
 * Allows child components (e.g. Header) to open/close the mobile sidebar drawer.
 */
export const SidebarContext = createContext<SidebarContextValue | null>(null);
