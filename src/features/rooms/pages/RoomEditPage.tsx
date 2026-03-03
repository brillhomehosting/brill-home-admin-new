import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui';
import { LoadingSpinner } from '@/shared/components/feedback';
import { ROUTES, MESSAGES } from '@/shared/constants';
import { useRoomDetail } from '../hooks/useRoomDetail';
import { useUpdateRoom, useUpdateRoomAmenities } from '../hooks/useRoomMutation';
import { RoomForm } from '../components/RoomForm';
import { RoomImageManager } from '../components/RoomImageManager';
import { RoomAmenityManager } from '../components/RoomAmenityManager';
import { TimeSlotManager } from '../components/TimeSlotManager';
import type { RoomUpdateRequest } from '@/shared/types';

// ================================================================
// RoomEditPage — edit form + image manager, split into sections
// ================================================================

export default function RoomEditPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { data: room, isLoading, isError } = useRoomDetail(roomId);
  const updateMutation = useUpdateRoom();
  const amenitiesMutation = useUpdateRoomAmenities();

  const handleSubmit = (payload: RoomUpdateRequest) => {
    if (!roomId) return;
    updateMutation.mutate(
      { roomId, data: payload },
      {
        onSuccess: () => {
          navigate(ROUTES.ROOMS);
        },
      },
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullPage label="Đang tải thông tin phòng..." />;
  }

  if (isError || !room) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center text-sm text-danger-500">
          Không tìm thấy phòng.
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <Header
        title={`Chỉnh sửa — ${room.name}`}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Phòng', path: ROUTES.ROOMS },
          { label: room.name },
        ]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
        }
      />

      <PageWrapper className="max-w-3xl">
        {/* ── Section: Basic info ── */}
        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Thông tin cơ bản
          </h2>
          <RoomForm
            room={room}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            submitLabel="Lưu thay đổi"
          />

          {updateMutation.isError && (
            <p className="mt-4 text-sm text-danger-600">{MESSAGES.ERROR}</p>
          )}
        </section>

        {/* ── Section: Images ── */}
        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Hình ảnh phòng
          </h2>
          <RoomImageManager roomId={room.id} images={room.images ?? []} />
        </section>

        {/* ── Section: Amenities ── */}
        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Tiện nghi phòng
          </h2>
          <RoomAmenityManager
            roomAmenities={room.amenities ?? []}
            onSave={(amenities) =>
              amenitiesMutation.mutate({ roomId: room.id, amenities })
            }
            isSaving={amenitiesMutation.isPending}
          />
        </section>

        {/* ── Section: Time Slots ── */}
        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Khung giờ
          </h2>
          <TimeSlotManager roomId={room.id} />
        </section>
      </PageWrapper>
    </>
  );
}
