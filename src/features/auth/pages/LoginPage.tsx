import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { LoginForm } from '../components/LoginForm';

// ================================================================
// LoginPage — centred card with branding & login form
// ================================================================

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If already logged in, redirect to intended destination or home
  const from = (location.state as { from?: Location })?.from?.pathname || '/';
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface px-8 py-10 shadow-lg">
          {/* Logo / Branding */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400 text-lg font-bold text-white shadow-md">
              B
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-foreground">
                Brill Home Stay
              </h1>
              <p className="mt-1 text-sm text-secondary-400">
                Đăng nhập vào hệ thống quản trị
              </p>
            </div>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-secondary-400">
          &copy; {new Date().getFullYear()} Brill Home Stay. All rights reserved.
        </p>
      </div>
    </div>
  );
}
