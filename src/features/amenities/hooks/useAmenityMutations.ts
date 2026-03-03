import { useMutation, useQueryClient } from '@tanstack/react-query';
import { amenityService } from '@/shared/services/amenity.service';
import { amenityKeys } from './queryKeys';
import type { Amenity } from '@/shared/types';

// ================================================================
// Amenity mutations — create · update · delete
// ================================================================

export function useCreateAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Pick<Amenity, 'name'> & Partial<Amenity>) =>
      amenityService.createAmenity(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: amenityKeys.all });
    },
  });
}

export function useUpdateAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Amenity> }) =>
      amenityService.updateAmenity(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: amenityKeys.all });
      qc.invalidateQueries({ queryKey: amenityKeys.detail(id) });
    },
  });
}

export function useDeleteAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => amenityService.deleteAmenity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: amenityKeys.all });
    },
  });
}
