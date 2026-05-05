import AmenityListPage from '@/features/amenities/pages/AmenityListPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import BookingDetailPage from '@/features/bookings/pages/BookingDetailPage';
import BookingListPage from '@/features/bookings/pages/BookingListPage';
import CreateBookingPage from '@/features/bookings/pages/CreateBookingPage';
import DiscountListPage from '@/features/discounts/pages/DiscountListPage';
import PaymentListPage from '@/features/payments/pages/PaymentListPage';
import HolidaySettingsPage from '@/features/settings/pages/HolidaySettingsPage';
import RoomPasswordPage from '@/features/room-passwords/pages/RoomPasswordPage';
import RoomCreatePage from '@/features/rooms/pages/RoomCreatePage';
import RoomDetailPage from '@/features/rooms/pages/RoomDetailPage';
import RoomEditPage from '@/features/rooms/pages/RoomEditPage';
import RoomListPage from '@/features/rooms/pages/RoomListPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import { ProtectedRoute } from '@/shared/components/auth';
import { Header, MainLayout, SidebarContext } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
import { useContext, useEffect } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

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
        element: <DashboardPage />,
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
        element: <BookingListPage />,
      },
      {
        path: 'apps/bookings/create',
        element: <CreateBookingPage />,
      },
      {
        path: 'apps/bookings/:bookingId',
        element: <BookingDetailPage />,
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
        element: <PaymentListPage />,
      },
      // Discounts
      {
        path: 'apps/discounts',
        element: <DiscountListPage />,
      },
      // Settings
      {
        path: 'settings',
        element: <PlaceholderPage title="Cài đặt" />,
      },
      {
        path: 'settings/holidays',
        element: <HolidaySettingsPage />,
      },
    ],
  },

  // ── Catch-all → redirect to home ──
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);
