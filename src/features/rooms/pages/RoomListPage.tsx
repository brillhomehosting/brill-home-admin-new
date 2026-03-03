import { PageWrapper } from '@/shared/components/layout';
import { Pagination, ConfirmDialog } from '@/shared/components/ui';
import { MESSAGES } from '@/shared/constants';
import { useRoomListPage } from '../hooks/useRoomListPage';
import { useDeleteRoom, useRestoreRoom } from '../hooks/useRoomMutation';
import { RoomListHeader } from '../components/RoomListHeader';
import { RoomTable } from '../components/RoomTable';
import type { Room } from '@/shared/types';

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
    <>
      <RoomListHeader
        totalElements={totalElements}
        search={search}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusFilter={handleStatusFilter}
      />

      <PageWrapper>
        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <RoomTable
            rooms={rooms}
            loading={isLoading}
            onDelete={setRoomToDelete}
            onRestore={handleRestore}
          />

          {/* Footer with pagination */}
          <div className="border-t border-border-light px-4 py-4 sm:px-6">
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
    </>
  );
}
