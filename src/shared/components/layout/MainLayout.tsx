import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarContext } from './SidebarContext';

/**
 * Main authenticated layout shell.
 * Fixed sidebar on desktop, drawer on mobile.
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <SidebarContext.Provider
      value={{ open: sidebarOpen, toggle: () => setSidebarOpen((v) => !v), openSidebar }}
    >
      <div className="flex min-h-screen bg-background w-full overflow-x-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Content area — offset by sidebar width on desktop only */}
        <main className="flex flex-1 flex-col lg:ml-60 min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
