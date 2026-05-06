import { PageWrapper } from '@/shared/components/layout';
import { Pagination, ConfirmDialog } from '@/shared/components/ui';
import { MESSAGES } from '@/shared/constants';
import { useRoomListPage } from '../hooks/useRoomListPage';
import { useDeleteRoom, useRestoreRoom } from '../hooks/useRoomMutation';
import { RoomListHeader } from '../components/RoomListHeader';
import { RoomTable } from '../components/RoomTable';
import type { Room } from '@/shared/types';
import { Search, ChevronDown } from 'lucide-react';

// ================================================================
// RoomListPage — full page: header, filter bar, table, pagination
// ================================================================

export default function RoomListPage() {
  const {
    rooms,
    totalElements,
    totalPages,
    isLoading,
    page,
    setPage,
    search,
    handleSearch,
    statusFilter,
    handleStatusFilter,
    roomToDelete,
    setRoomToDelete,
  } = useRoomListPage();

  const deleteMutation = useDeleteRoom();
  const restoreMutation = useRestoreRoom();

  // ── Handlers ──
  const handleDeleteConfirm = () => {
    if (!roomToDelete) return;
    deleteMutation.mutate(roomToDelete.id, {
      onSettled: () => setRoomToDelete(null),
    });
  };

  const handleRestore = (room: Room) => {
    restoreMutation.mutate(room.id);
  };

  return (
    <div className="flex h-full flex-col">
      <RoomListHeader />

      <PageWrapper className="flex-1 space-y-6">
        {/* Table card */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
          {/* Filters — inside the card like BookingList */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                />
              </div>
              <div className="relative w-44 shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>
            </div>
            <span className="text-sm text-secondary-400">
              {totalElements} phòng
            </span>
          </div>

          {/* Table */}
          <RoomTable
            rooms={rooms}
            loading={isLoading}
            onDelete={setRoomToDelete}
            onRestore={handleRestore}
          />

          {/* Footer with pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              summary={`Hiển thị ${rooms.length} / ${totalElements} phòng`}
            />
          </div>
        </div>
      </PageWrapper>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa phòng"
        message={`${MESSAGES.ROOMS.DELETE_CONFIRM} "${roomToDelete?.name ?? ''}"`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
