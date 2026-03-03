import { useState, useCallback, useMemo } from 'react';
import type { Amenity } from '@/shared/types';

export type AmenityFormData = {
  name: string;
  icon: string;
  description: string;
};

type ValidationErrors = Partial<Record<keyof AmenityFormData, string>>;

const EMPTY_FORM: AmenityFormData = {
  name: '',
  icon: '',
  description: '',
};

function toFormData(amenity?: Amenity): AmenityFormData {
  if (!amenity) return { ...EMPTY_FORM };
  return {
    name: amenity.name ?? '',
    icon: amenity.icon ?? '',
    description: amenity.description ?? '',
  };
}

export function useAmenityForm(amenity?: Amenity) {
  const [form, setForm] = useState<AmenityFormData>(() => toFormData(amenity));
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset when amenity changes (e.g. navigation)
  const reset = useCallback((next?: Amenity) => {
    setForm(toFormData(next));
    setErrors({});
  }, []);

  const handleChange = useCallback(
    <K extends keyof AmenityFormData>(field: K, value: AmenityFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const next: ValidationErrors = {};
    if (!form.name.trim()) {
      next.name = 'Bạn phải nhập tên tiện nghi';
    } else if (form.name.trim().length < 2) {
      next.name = 'Tên tiện nghi phải có ít nhất 2 ký tự';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const isDirty = useMemo(() => {
    const initial = toFormData(amenity);
    return (
      form.name !== initial.name ||
      form.icon !== initial.icon ||
      form.description !== initial.description
    );
  }, [form, amenity]);

  return { form, errors, handleChange, validate, isDirty, reset };
}
