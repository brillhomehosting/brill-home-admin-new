import { PageWrapper } from '@/shared/components/layout';
import { Pagination, ConfirmDialog, Select } from '@/shared/components/ui';
import { MESSAGES } from '@/shared/constants';
import { useRoomListPage } from '../hooks/useRoomListPage';
import { useDeleteRoom, useRestoreRoom } from '../hooks/useRoomMutation';
import { RoomListHeader } from '../components/RoomListHeader';
import { RoomTable } from '../components/RoomTable';
import type { Room } from '@/shared/types';
import { Search } from 'lucide-react';

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
          <div className="flex flex-col gap-3 border-b border-border p-3.5 bg-surface/50">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="relative col-span-1 sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-base sm:text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'Trạng thái' },
                  { value: 'active', label: 'Bật' },
                  { value: 'inactive', label: 'Tắt' },
                ]}
                className="h-10"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 px-1 sm:px-0">
               <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider">
                 Tổng số: {totalElements}
               </span>
            </div>
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
