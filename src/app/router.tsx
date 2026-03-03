import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { SidebarContext, Header } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
import { MainLayout } from '@/shared/components/layout';
import { ProtectedRoute } from '@/shared/components/auth';
import LoginPage from '@/features/auth/pages/LoginPage';
import RoomListPage from '@/features/rooms/pages/RoomListPage';
import RoomCreatePage from '@/features/rooms/pages/RoomCreatePage';
import RoomEditPage from '@/features/rooms/pages/RoomEditPage';
import RoomDetailPage from '@/features/rooms/pages/RoomDetailPage';
import AmenityListPage from '@/features/amenities/pages/AmenityListPage';
import RoomPasswordPage from '@/features/room-passwords/pages/RoomPasswordPage';

// ── Lazy placeholder for future pages ──
function PlaceholderPage({ title }: { title: string }) {
  const openSidebar = useContext(SidebarContext)?.openSidebar;

  useEffect(() => {
    openSidebar?.();
  }, [openSidebar]);

  return (
    <>
      <Header title={title} />
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-secondary-400">
            Trang này đang được phát triển.
          </p>
        </div>
      </div>
    </>
  );
}

// ================================================================
// Application router
// ================================================================

export const router = createBrowserRouter([
  // ── Public routes ──
  {
    path: ROUTES.SIGN_IN,
    element: <LoginPage />,
  },

  // ── Protected routes (with MainLayout shell) ──
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard — redirect / → dashboard placeholder
      {
        index: true,
        element: <PlaceholderPage title="Dashboard" />,
      },
      // Rooms
      {
        path: 'apps/rooms',
        element: <RoomListPage />,
      },
      {
        path: 'apps/rooms/add',
        element: <RoomCreatePage />,
      },
      {
        path: 'apps/rooms/edit/:roomId',
        element: <RoomEditPage />,
      },
      {
        path: 'apps/rooms/:roomId',
        element: <RoomDetailPage />,
      },
      // Amenities
      {
        path: 'apps/amenities',
        element: <Navigate to="/apps/amenities/list" replace />,
      },
      {
        path: 'apps/amenities/list',
        element: <AmenityListPage />,
      },
      // Bookings
      {
        path: 'apps/bookings',
        element: <PlaceholderPage title="Đặt phòng" />,
      },
      // Schedules
      {
        path: 'apps/schedules',
        element: <PlaceholderPage title="Lịch trình" />,
      },
      {
        path: 'apps/schedules/*',
        element: <PlaceholderPage title="Loại lịch" />,
      },
      // Random Generator / Room Passwords
      {
        path: 'apps/random-generator',
        element: <RoomPasswordPage />,
      },
      // Customers
      {
        path: 'apps/customers',
        element: <PlaceholderPage title="Khách hàng" />,
      },
      // Invoices
      {
        path: 'apps/invoices',
        element: <PlaceholderPage title="Hóa đơn" />,
      },
      // Settings
      {
        path: 'settings',
        element: <PlaceholderPage title="Cài đặt" />,
      },
    ],
  },

  // ── Catch-all → redirect to home ──
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);
