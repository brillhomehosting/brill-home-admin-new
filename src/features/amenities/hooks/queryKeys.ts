// ================================================================
// Amenity query-key factory
// ================================================================

export const amenityKeys = {
  all: ['amenities'] as const,
  lists: () => [...amenityKeys.all, 'list'] as const,
  detail: (id: string) => [...amenityKeys.all, 'detail', id] as const,
};
