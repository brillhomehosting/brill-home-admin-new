import { useNavigate } from 'react-router-dom';
import { Header, PageWrapper } from '@/shared/components/layout';
import { ROUTES, MESSAGES } from '@/shared/constants';
import { useCreateRoom } from '../hooks/useRoomMutation';
import { RoomForm } from '../components/RoomForm';
import type { RoomCreateRequest, RoomUpdateRequest } from '@/shared/types';

// ================================================================
// RoomCreatePage — header + form card
// ================================================================

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateRoom();

  const handleSubmit = (payload: RoomUpdateRequest) => {
    // RoomForm always provides name — safe to cast
    createMutation.mutate(payload as RoomCreateRequest, {
      onSuccess: (newRoom) => {
        // Navigate to edit page so user can manage images
        navigate(ROUTES.ROOM_EDIT(newRoom.id), { replace: true });
      },
    });
  };

  return (
    <>
      <Header
        title="Thêm phòng mới"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Phòng', path: ROUTES.ROOMS },
          { label: 'Thêm mới' },
        ]}
      />

      <PageWrapper className="max-w-3xl">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Thông tin phòng
          </h2>
          <RoomForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            submitLabel="Tạo phòng"
          />

          {createMutation.isError && (
            <p className="mt-4 text-sm text-danger-600">
              {MESSAGES.ERROR}
            </p>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
