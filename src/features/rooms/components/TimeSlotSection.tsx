import { useRef, useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  DollarSign,
  Moon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils';
import { Button, ConfirmDialog } from '@/shared/components/ui';
import { useToast } from '@/shared/components/feedback/Toast';
import {
  useTimeSlotAvailability,
  useCreateBooking,
  useDeleteBooking,
} from '../hooks/useTimeSlotBooking';
import type { TimeSlotAvailabilityItem } from '@/shared/types';

type TimeSlotSectionProps = {
  roomId: string;
};

/**
 * Format a Date to local YYYY-MM-DD string (not UTC).
 */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Format YYYY-MM-DD → dd/MM/yyyy for display.
 */
function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ================================================================
// TimeSlotSection — shows time-slot availability for a room + date
// ================================================================

export function TimeSlotSection({ roomId }: TimeSlotSectionProps) {
  const { toast } = useToast();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // ── Date state ──
  const today = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // ── Data fetching ──
  const { data: slots, isLoading, isError, isFetching } =
    useTimeSlotAvailability(roomId, selectedDate);

  // ── Mutations ──
  const createBooking = useCreateBooking();
  const deleteBooking = useDeleteBooking();

  // ── Confirmation dialog state ──
  const [bookingConfirm, setBookingConfirm] = useState<{
    item: TimeSlotAvailabilityItem;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    item: TimeSlotAvailabilityItem;
  } | null>(null);

  // ── Handlers ──
  const handleBook = () => {
    if (!bookingConfirm) return;
    const { item } = bookingConfirm;
    createBooking.mutate(
      {
        roomId,
        timeSlotId: item.timeSlot.id,
        date: selectedDate,
      },
      {
        onSuccess: () => {
          toast('Đặt khung giờ thành công', 'success');
          setBookingConfirm(null);
        },
        onError: () => {
          toast('Không thể đặt khung giờ', 'error');
          setBookingConfirm(null);
        },
      },
    );
  };

  const handleDeleteBooking = () => {
    if (!deleteConfirm?.item.bookingId) return;
    deleteBooking.mutate(deleteConfirm.item.bookingId, {
      onSuccess: () => {
        toast('Xóa đặt phòng thành công', 'success');
        setDeleteConfirm(null);
      },
      onError: () => {
        toast('Không thể xóa đặt phòng', 'error');
        setDeleteConfirm(null);
      },
    });
  };

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Khung giờ</h2>

      {/* ── Date picker ── */}
      <div
        className="relative mb-2 flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary-50 px-4 py-2.5 transition-colors hover:border-accent-300"
        onClick={() => dateInputRef.current?.showPicker?.()}
      >
        <Calendar className="h-5 w-5 shrink-0 text-accent-500" />
        <div className="flex-1">
          <span className="block text-[11px] leading-tight text-secondary-400">
            Kiểm tra tình trạng theo ngày
          </span>
          <span className="text-sm font-semibold text-foreground">
            {formatDisplayDate(selectedDate)}
          </span>
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
        )}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
          tabIndex={-1}
        />
      </div>

      <p className="mb-5 text-xs text-secondary-400">
        Chọn ngày để xem khung giờ nào còn trống hoặc đã được đặt
      </p>

      {/* ── Content ── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-secondary-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-24 rounded bg-secondary-200" />
                <div className="h-5 w-16 rounded-full bg-secondary-200" />
              </div>
              <div className="mb-2 h-4 w-32 rounded bg-secondary-100" />
              <div className="mb-3 h-4 w-28 rounded bg-secondary-100" />
              <div className="h-9 w-full rounded-lg bg-secondary-200" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-danger-200 bg-danger-50 text-danger-500">
          <CalendarX className="h-8 w-8" />
          <p className="text-sm font-medium">Không thể tải khung giờ</p>
          <p className="text-xs text-danger-400">Vui lòng thử lại sau</p>
        </div>
      )}

      {!isLoading && !isError && slots && slots.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-secondary-200 text-secondary-400">
          <Clock className="h-8 w-8" />
          <p className="text-sm">Chưa có khung giờ nào cho phòng này</p>
        </div>
      )}

      {!isLoading && !isError && slots && slots.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {slots.map((raw, idx) => {
            const item: TimeSlotAvailabilityItem = {
              timeSlot: raw.timeSlot,
              isActive: raw.status === 'AVAILABLE',
              bookingId: raw.bookingId ?? undefined,
            };
            return (
              <TimeSlotCard
                key={item.timeSlot.id}
                item={item}
                index={idx + 1}
                onBook={() => setBookingConfirm({ item })}
                onDeleteBooking={() => setDeleteConfirm({ item })}
                isMutating={
                  (createBooking.isPending &&
                    createBooking.variables?.timeSlotId === item.timeSlot.id) ||
                  (deleteBooking.isPending &&
                    deleteBooking.variables === item.bookingId)
                }
              />
            );
          })}
        </div>
      )}

      {/* ── Booking confirmation dialog ── */}
      <ConfirmDialog
        open={!!bookingConfirm}
        onClose={() => setBookingConfirm(null)}
        onConfirm={handleBook}
        variant="primary"
        title="Đặt khung giờ"
        message={
          bookingConfirm
            ? `Đặt khung giờ ${bookingConfirm.item.timeSlot.startTime} - ${bookingConfirm.item.timeSlot.endTime} ngày ${formatDisplayDate(selectedDate)}?`
            : ''
        }
        confirmLabel="Đặt khung giờ"
        loading={createBooking.isPending}
      />

      {/* ── Delete booking confirmation ── */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteBooking}
        variant="danger"
        title="Xóa đặt phòng"
        message={
          deleteConfirm
            ? `Xóa đặt phòng khung giờ ${deleteConfirm.item.timeSlot.startTime} - ${deleteConfirm.item.timeSlot.endTime} ngày ${formatDisplayDate(selectedDate)}?`
            : ''
        }
        confirmLabel="Xóa đặt phòng"
        loading={deleteBooking.isPending}
      />
    </section>
  );
}

// ── Individual time-slot card ──

function TimeSlotCard({
  item,
  index,
  onBook,
  onDeleteBooking,
  isMutating,
}: {
  item: TimeSlotAvailabilityItem;
  index: number;
  onBook: () => void;
  onDeleteBooking: () => void;
  isMutating?: boolean;
}) {
  const { timeSlot, isActive, bookingId } = item;
  const isBooked = !isActive;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border transition-all duration-200 overflow-hidden',
        isBooked
          ? 'border-danger-200 bg-gradient-to-b from-danger-50/40 to-white'
          : 'border-success-200 bg-gradient-to-b from-success-50/40 to-white hover:shadow-md hover:border-success-300',
        isMutating && 'pointer-events-none opacity-60',
      )}
    >
      {/* ── Header bar ── */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2.5',
          isBooked ? 'bg-danger-50' : 'bg-success-50',
        )}
      >
        <h3 className="text-sm font-bold text-foreground">
          Khung giờ {index}
        </h3>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            isBooked
              ? 'bg-danger-100 text-danger-700'
              : 'bg-success-100 text-success-700',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isBooked ? 'bg-danger-500' : 'bg-success-500',
            )}
          />
          {isBooked ? 'Đã đặt' : 'Có sẵn'}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col px-4 py-3 gap-2">
        {/* Overnight tag */}
        {timeSlot.isOvernight && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-info-600">
            <Moon className="h-3.5 w-3.5" />
            Qua đêm
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-secondary-700">
          <Clock className="h-4 w-4 shrink-0 text-secondary-400" />
          <span className="font-semibold">
            {timeSlot.startTime ?? '—'} - {timeSlot.endTime ?? '—'}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-sm text-secondary-700">
          <DollarSign className="h-4 w-4 shrink-0 text-secondary-400" />
          <span className="font-semibold">
            {timeSlot.price != null ? formatCurrency(timeSlot.price) : '—'}
          </span>
        </div>
      </div>

      {/* ── Action ── */}
      <div className="px-4 pb-4">
        {isActive ? (
          <Button className="w-full" variant="primary" size="sm" onClick={onBook}>
            <CalendarCheck className="mr-1.5 h-4 w-4" />
            Đặt khung giờ
          </Button>
        ) : bookingId ? (
          <Button className="w-full" variant="danger" size="sm" onClick={onDeleteBooking}>
            <CalendarX className="mr-1.5 h-4 w-4" />
            Xóa đặt phòng
          </Button>
        ) : (
          <p className="py-1 text-center text-xs text-secondary-400">
            Khung giờ này đã được đặt
          </p>
        )}
      </div>
    </div>
  );
}
