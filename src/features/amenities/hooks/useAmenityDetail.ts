import { useQuery } from '@tanstack/react-query';
import { amenityService } from '@/shared/services/amenity.service';
import { amenityKeys } from './queryKeys';

/**
 * Fetch single amenity by id.
 * Disabled when id is empty or 'new'.
 */
export function useAmenityDetail(id?: string) {
  return useQuery({
    queryKey: amenityKeys.detail(id ?? ''),
    queryFn: () => amenityService.getAmenity(id!),
    enabled: Boolean(id) && id !== 'new',
  });
}
