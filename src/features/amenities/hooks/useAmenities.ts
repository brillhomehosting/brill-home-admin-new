import { useQuery } from '@tanstack/react-query';
import { amenityService } from '@/shared/services/amenity.service';
import { amenityKeys } from './queryKeys';

/**
 * Fetch full amenity list.
 * Client-side search/filter is handled by the caller.
 */
export function useAmenities() {
  return useQuery({
    queryKey: amenityKeys.lists(),
    queryFn: () => amenityService.getAmenities(),
  });
}
