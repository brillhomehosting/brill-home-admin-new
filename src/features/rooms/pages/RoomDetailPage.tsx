import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil,
  ArrowLeft,
  Users,
  BedDouble,
  Ruler,
  Clock,
  Moon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { LoadingSpinner } from '@/shared/components/feedback';
import { Badge, Button } from '@/shared/components/ui';
import { DynamicIcon } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency } from '@/shared/utils';
import { useRoomDetail } from '../hooks/useRoomDetail';
import { TimeSlotSection } from '../components/TimeSlotSection';
import type { ERoomType } from '@/shared/types/enums';

// ── Room-type badge config (reused from RoomTable) ──
const ROOM_TYPE_LABEL: Record<string, string> = {
  NORMAL: 'Thường',
  STANDARD: 'Standard',
  VIP: 'VIP',
  PREMIUM: 'Premium',
};

// ================================================================
// RoomDetailPage — read-only view of a single room
// ================================================================

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { data: room, isLoading, isError } = useRoomDetail(roomId);

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

  const typeLabel =
    ROOM_TYPE_LABEL[(room.roomType as string) ?? 'NORMAL'] ?? room.roomType;
  const typeBadgeVariant =
    ((room.roomType as string) ?? 'NORMAL') as ERoomType;

  return (
    <>
      <Header
        title={room.name}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Phòng', path: ROUTES.ROOMS },
          { label: room.name },
        ]}
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.ROOMS)}
            >
              <ArrowLeft className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.ROOM_EDIT(room.id))}
            >
              <Pencil className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </Button>
          </div>
        }
      />

      <PageWrapper>
        {/* ── Top section: Gallery (left) + Info (right) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Gallery — left column */}
          <section className="lg:col-span-3 rounded-xl border border-border bg-surface shadow-card overflow-hidden">
            {room.images && room.images.length > 0 ? (
              <RoomGallery images={room.images} roomName={room.name} />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center bg-secondary-100 text-secondary-400 sm:min-h-[280px]">
                <span className="text-5xl">🏠</span>
              </div>
            )}
          </section>

          {/* Room info — right column */}
          <section className="lg:col-span-2 rounded-xl border border-border bg-surface p-4 shadow-card flex flex-col sm:p-6">
            {/* Name + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h2 className="text-xl font-bold text-foreground">{room.name}</h2>
              <Badge variant={typeBadgeVariant}>{typeLabel}</Badge>
              {room.isActive !== false ? (
                <Badge variant="success" dot>
                  Hoạt động
                </Badge>
              ) : (
                <Badge variant="danger" dot>
                  Ngừng HĐ
                </Badge>
              )}
            </div>

            {room.description && (
              <p className="text-sm leading-relaxed text-secondary-600 mb-5">
                {room.description}
              </p>
            )}

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              <InfoCard
                icon={<Users className="h-5 w-5 text-accent-500" />}
                label="Sức chứa"
                value={room.capacity != null ? `${room.capacity} người` : '—'}
              />
              <InfoCard
                icon={<BedDouble className="h-5 w-5 text-accent-500" />}
                label="Số giường"
                value={room.numberOfBeds != null ? `${room.numberOfBeds}` : '—'}
              />
              <InfoCard
                icon={<Ruler className="h-5 w-5 text-accent-500" />}
                label="Diện tích"
                value={room.area != null ? `${room.area} m²` : '—'}
              />
              <InfoCard
                icon={<Clock className="h-5 w-5 text-accent-500" />}
                label="Giá theo giờ"
                value={
                  room.hourlyRate != null
                    ? formatCurrency(room.hourlyRate)
                    : '—'
                }
              />
            </div>

            {/* Overnight rate */}
            {room.overnightRate != null && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-accent-50 px-4 py-3 border border-accent-100">
                <Moon className="h-5 w-5 text-accent-600" />
                <div>
                  <span className="text-xs font-medium uppercase text-accent-600">
                    Giá qua đêm
                  </span>
                  <p className="text-lg font-bold text-accent-700">
                    {formatCurrency(room.overnightRate)}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Amenities — full width below ── */}
        {room.amenities && room.amenities.length > 0 && (
          <section className="mt-6 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Tiện nghi
            </h2>
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {room.amenities.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                    a.isHighlight
                      ? 'border-accent-200 bg-accent-50 ring-1 ring-accent-200'
                      : 'border-border-light bg-secondary-50',
                  )}
                >
                  <DynamicIcon
                    name={a.icon}
                    className={cn(
                      'h-5 w-5 shrink-0',
                      a.isHighlight ? 'text-accent-600' : 'text-accent-500',
                    )}
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    a.isHighlight ? 'text-accent-700' : 'text-foreground',
                  )}>
                    {a.name}
                  </span>
                  {a.isHighlight && (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-accent-500">
                      Nổi bật
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Time Slots — full width below ── */}
        <TimeSlotSection roomId={room.id} />
      </PageWrapper>
    </>
  );
}

// ── Small info card used in the stats grid ──

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-secondary-50 px-3 py-2.5 border border-border-light sm:gap-3 sm:px-4 sm:py-3">
      {icon}
      <div className="min-w-0">
        <span className="block text-[11px] font-medium uppercase text-secondary-500 sm:text-xs">
          {label}
        </span>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Gallery with limited preview + lightbox ──

const MAX_VISIBLE = 5;

function RoomGallery({
  images,
  roomName,
}: {
  images: { id: string; url: string }[];
  roomName: string;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const visible = images.slice(0, MAX_VISIBLE);
  const remaining = images.length - MAX_VISIBLE;

  if (images.length === 1) {
    return (
      <>
        <img
          src={images[0].url}
          alt={roomName}
          className="h-full min-h-[200px] w-full cursor-pointer object-cover sm:min-h-[280px]"
          onClick={() => setLightboxIdx(0)}
        />
        {lightboxIdx !== null && (
          <ImageLightbox
            images={images}
            currentIndex={lightboxIdx}
            onChange={setLightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        {visible.map((img, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === visible.length - 1 && remaining > 0;

          return (
            <div
              key={img.id ?? idx}
              className={`relative cursor-pointer overflow-hidden ${
                isFirst ? 'col-span-2' : ''
              }`}
              onClick={() => setLightboxIdx(idx)}
            >
              <img
                src={img.url}
                alt={`${roomName} - ${idx + 1}`}
                className={`w-full object-cover transition-transform duration-200 hover:scale-105 ${
                  isFirst ? 'h-40 sm:h-52' : 'h-28 sm:h-36'
                }`}
              />
              {/* "+N" overlay on last visible thumbnail */}
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors hover:bg-black/40">
                  <span className="text-lg font-bold text-white sm:text-xl">
                    +{remaining}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightboxIdx !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIdx}
          onChange={setLightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

// ── Full-screen image lightbox ──

function ImageLightbox({
  images,
  currentIndex,
  onChange,
  onClose,
}: {
  images: { id: string; url: string }[];
  currentIndex: number;
  onChange: (idx: number) => void;
  onClose: () => void;
}) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(
    () => hasPrev && onChange(currentIndex - 1),
    [hasPrev, currentIndex, onChange],
  );
  const goNext = useCallback(
    () => hasNext && onChange(currentIndex + 1),
    [hasNext, currentIndex, onChange],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:right-5 sm:top-5"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white sm:left-5 sm:top-5 sm:text-sm">
        {currentIndex + 1} / {images.length}
      </span>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={goPrev}
          className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:left-4 sm:h-12 sm:w-12"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={goNext}
          className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:right-4 sm:h-12 sm:w-12"
          aria-label="Ảnh tiếp"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[currentIndex].url}
        alt={`Ảnh ${currentIndex + 1}`}
        className="relative z-[1] max-h-[85vh] max-w-[90vw] rounded-lg object-contain sm:max-w-[80vw]"
      />
    </div>
  );
}
