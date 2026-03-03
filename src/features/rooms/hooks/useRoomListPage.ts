import { useState, useCallback, useMemo } from 'react';
import { useRooms } from './useRooms';
import type { GetRoomsParams, Room } from '@/shared/types';

// ================================================================
// useRoomListPage — state management for the room list page
// ================================================================

export function useRoomListPage() {
  // ── Pagination ──
  const [page, setPage] = useState(0);
  const [limit] = useState(10);

  // ── Search ──
  const [search, setSearch] = useState('');

  // ── Filter by status ──
  const [statusFilter, setStatusFilter] = useState<string>('');

  // ── Delete dialog ──
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // ── Build query params ──
  const params = useMemo<GetRoomsParams>(
    () => ({
      page,
      limit,
      name: search || undefined,
      isActive:
        statusFilter === 'active'
          ? true
          : statusFilter === 'inactive'
            ? false
            : undefined,
    }),
    [page, limit, search, statusFilter],
  );

  const query = useRooms(params);

  const rooms = query.data?.data?.content ?? [];
  const totalElements = query.data?.data?.totalElements ?? 0;
  const totalPages = query.data?.data?.totalPages ?? 1;

  // ── Actions ──
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1); // reset to first page on new search
    },
    [],
  );

  const handleStatusFilter = useCallback(
    (value: string) => {
      setStatusFilter(value);
      setPage(1);
    },
    [],
  );

  return {
    // Data
    rooms,
    totalElements,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,

    // Pagination
    page,
    setPage,

    // Filters
    search,
    handleSearch,
    statusFilter,
    handleStatusFilter,

    // Delete
    roomToDelete,
    setRoomToDelete,
  };
}
