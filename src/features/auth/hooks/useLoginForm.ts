import { useState, useCallback, type FormEvent } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { MESSAGES } from '@/shared/constants';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/shared/types';

// ================================================================
// useLoginForm — manages form state, validation & submit
// ================================================================

type LoginFormState = {
  username: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof LoginFormState, string>>;

export function useLoginForm() {
  const { login } = useAuth();

  const [values, setValues] = useState<LoginFormState>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Field change handler ──
  const handleChange = useCallback(
    (field: keyof LoginFormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear field error on change
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerError(null);
      },
    [],
  );

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const next: FieldErrors = {};

    if (!values.username.trim()) {
      next.username = 'Vui lòng nhập tên đăng nhập';
    }
    if (!values.password) {
      next.password = 'Vui lòng nhập mật khẩu';
    } else if (values.password.length < 6) {
      next.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values]);

  // ── Submit ──
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      setServerError(null);

      try {
        await login(values.username.trim(), values.password);
        // Navigation is handled by the router/redirect logic
      } catch (err) {
        const axiosErr = err as AxiosError<ApiResponse<null>>;
        const message =
          axiosErr.response?.data?.message || MESSAGES.AUTH.LOGIN_FAILED;
        setServerError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, login],
  );

  return {
    values,
    errors,
    serverError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
