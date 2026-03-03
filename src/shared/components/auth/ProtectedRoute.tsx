import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { LoadingSpinner } from '@/shared/components/feedback';
import { ROUTES } from '@/shared/constants';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * Route guard — redirects unauthenticated users to /sign-in.
 * Shows a full-page spinner while the initial auth check runs.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SIGN_IN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
