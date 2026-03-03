import { AlertCircle } from 'lucide-react';
import { Input } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { useLoginForm } from '../hooks/useLoginForm';

// ================================================================
// LoginForm — username/password form with validation & error display
// ================================================================

export function LoginForm() {
  const {
    values,
    errors,
    serverError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      {/* Server error banner */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Username */}
      <Input
        label="Tên đăng nhập"
        type="text"
        placeholder="Nhập tên đăng nhập"
        autoComplete="username"
        autoFocus
        value={values.username}
        onChange={handleChange('username')}
        error={errors.username}
        disabled={isSubmitting}
      />

      {/* Password */}
      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Nhập mật khẩu"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={isSubmitting}
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="mt-2 w-full"
      >
        Đăng nhập
      </Button>
    </form>
  );
}
