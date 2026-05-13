import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
  BedDouble,
  CalendarClock,
  ChevronRight,
  Clock,
  CreditCard,
  Hash,
  Phone,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export function timeUntil(dateStr: string) {
  const diff = Math.floor((new Date(dateStr).getTime() - Date.now()) / 1000);
  if (diff <= 0) return null;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút nữa`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return m > 0 ? `${h}g ${m}p nữa` : `${h} giờ nữa`;
  }
  return null;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bar: string; badge: string; dot: string; text: string }> = {
  CONFIRMED: { label: 'Đã xác nhận', bar: 'bg-primary-400',  badge: 'bg-primary-100 text-primary-700', dot: 'bg-primary-500', text: 'text-primary-700' },
  CANCELLED: { label: 'Đã hủy',      bar: 'bg-danger-400',   badge: 'bg-danger-100 text-danger-700',   dot: 'bg-danger-500',  text: 'text-danger-700'  },
  PENDING:   { label: 'Chờ xử lý',   bar: 'bg-warning-400',  badge: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500', text: 'text-warning-700' },
};

const DEFAULT_STATUS = { label: '', bar: 'bg-secondary-300', badge: 'bg-secondary-100 text-secondary-700', dot: 'bg-secondary-400', text: 'text-secondary-600' };

// ── RecentBookingItem — used in Dashboard "Đặt phòng gần đây" ────────────────

type RecentBookingProps = {
  booking: {
    bookingId: string;
    bookingCode: string;
    guestName?: string;
    roomName: string;
    roomType?: string;
    checkInAt: string;
    status: string;
    finalAmount: number;
    createdAt: string;
  };
};

export function RecentBookingItem({ booking }: RecentBookingProps) {
  const s = STATUS_MAP[booking.status] ?? DEFAULT_STATUS;
  const guestName = booking.guestName || 'Chưa có khách';
  const initials = getInitials(guestName);
  const ago = timeAgo(booking.createdAt);
  const isVip = booking.roomType === 'VIP';

  return (
    <Link
      to={`/apps/bookings/${booking.bookingId}`}
      className="group flex items-center gap-3 px-4 py-3 hover:bg-secondary-50/70 transition-colors relative"
    >
      <div className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full', s.bar)} />
      <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center group-hover:bg-primary-200 transition-colors">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-foreground">#{booking.bookingCode}</span>
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', s.badge)}>{s.label}</span>
          {isVip && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">VIP</span>}
        </div>
        <p className="text-[11px] text-secondary-500 truncate mt-0.5">
          {guestName} · <span className="font-medium text-secondary-600">{booking.roomName}</span>
        </p>
        <p className="text-[10px] text-secondary-400 mt-0.5">{ago}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-black text-foreground">{formatCurrency(booking.finalAmount)}</p>
        <p className="text-[10px] text-secondary-400 flex items-center justify-end gap-0.5 mt-0.5">
          <Clock className="h-2.5 w-2.5" />
          {formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </Link>
  );
}

// ── UpcomingBookingItem — used in Dashboard "Sắp check-in" ──────────────────

type UpcomingBookingProps = {
  booking: {
    bookingId: string;
    bookingCode: string;
    guestName?: string;
    roomName: string;
    roomType?: string;
    checkInAt: string;
    checkOutAt: string;
    status: string;
    finalAmount: number;
  };
};

export function UpcomingBookingItem({ booking }: UpcomingBookingProps) {
  const checkInTime = formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' });
  const checkOutTime = formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit' });
  const countdown = timeUntil(booking.checkInAt);
  const guestName = booking.guestName || 'Chưa có khách';
  const initials = getInitials(guestName);
  const isVip = booking.roomType === 'VIP';
  const isUrgent = countdown && (countdown.includes('phút') || (countdown.includes('g') && parseInt(countdown) <= 2));

  return (
    <Link
      to={`/apps/bookings/${booking.bookingId}`}
      className="group flex items-center gap-3 px-4 py-3 hover:bg-accent-50/40 transition-colors relative"
    >
      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-accent-400" />
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-sm font-black text-accent-600 leading-none">{checkInTime}</p>
        <p className="text-[9px] text-secondary-400 mt-0.5 leading-none">→ {checkOutTime}</p>
      </div>
      <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-accent-100 text-accent-700 font-bold text-xs flex items-center justify-center group-hover:bg-accent-200 transition-colors">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-foreground truncate">{guestName}</span>
          {isVip && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">VIP</span>}
        </div>
        <p className="text-[11px] text-secondary-500 truncate mt-0.5">
          #{booking.bookingCode} · <span className="font-medium text-secondary-600">{booking.roomName}</span>
        </p>
        {countdown && (
          <p className={cn('text-[10px] font-bold mt-0.5', isUrgent ? 'text-danger-600' : 'text-warning-600')}>
            {isUrgent ? '⚠ ' : '⏱ '}{countdown}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-black text-foreground">{formatCurrency(booking.finalAmount)}</p>
      </div>
    </Link>
  );
}

// ── BookingListCard — used in BookingListPage (full booking list) ─────────────
// Shows more detail: phone, date, payment method, check-in/out times

export type BookingListItem = {
  bookingId: string;
  bookingCode: string;
  guestName?: string;
  guestPhone?: string;
  roomName: string;
  date: string;
  checkInAt: string;
  checkOutAt: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  paymentMethod?: string;
};

type BookingListCardProps = {
  booking: BookingListItem;
  index?: number;
};

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  OTHER: 'Khác',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay',
  CREDIT_CARD: 'Thẻ',
};

export function BookingListCard({ booking, index = 0 }: BookingListCardProps) {
  const s = STATUS_MAP[booking.status] ?? DEFAULT_STATUS;
  const guestName = booking.guestName || 'Chưa có khách';
  const initials = getInitials(guestName);
  const methodLabel = booking.paymentMethod ? (METHOD_LABEL[booking.paymentMethod] ?? booking.paymentMethod) : null;
  const checkInTime = formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' });
  const checkOutTime = formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit' });
  const bookingDate = formatDate(booking.date, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const createdAgo = timeAgo(booking.createdAt);
  const isEven = index % 2 === 0;

  return (
    <Link
      to={`/apps/bookings/${booking.bookingId}`}
      className={cn(
        'group relative block overflow-hidden transition-all',
        // Mobile: card style
        'rounded-2xl border border-border p-4 shadow-sm hover:shadow-md mb-3 md:mb-0',
        // Desktop: table row style with spacing between rows
        'md:rounded-xl md:border md:border-border/40 md:p-0 md:shadow-none md:hover:shadow-sm md:hover:border-accent-200 md:hover:bg-primary-50/30 md:my-1.5 first:md:mt-0 last:md:mb-0',
        // Zebra striping for desktop
        isEven ? 'md:bg-surface' : 'md:bg-secondary-50/40',
      )}
    >
      {/* Sidebar indicator */}
      <div className={cn('absolute inset-y-0 left-0 w-1.5 transition-colors md:inset-y-1.5 md:left-0.5 md:w-1 md:rounded-full', s.bar)} />

      {/* --- Mobile View (< md) --- */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Header: Guest Name & Code */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-base font-black text-foreground">{guestName}</h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-black text-secondary-600">
                <Hash className="h-2.5 w-2.5" />
                {booking.bookingCode}
              </span>
              <span className="text-[10px] font-semibold text-secondary-400">{createdAgo}</span>
            </div>
          </div>
          <div className="shrink-0">
             <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tight', s.badge)}>
                {s.label}
             </span>
          </div>
        </div>

        {/* Body: Room & Time */}
        <div className="flex items-center gap-3 rounded-xl bg-secondary-50/70 p-3">
          <div className="min-w-0 flex-1 border-r border-border/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Lưu trú</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-sm font-black text-foreground">{checkInTime}</span>
              <span className="text-xs font-semibold text-secondary-400">→</span>
              <span className="text-sm font-black text-foreground">{checkOutTime}</span>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-secondary-500">{bookingDate}</p>
          </div>
          <div className="min-w-0 flex-1 pl-1">
             <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Phòng & LH</p>
             <p className="mt-1 flex items-center gap-1 truncate text-xs font-bold text-foreground">
               <BedDouble className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
               <span className="truncate">{booking.roomName}</span>
             </p>
             <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-secondary-500">
               <Phone className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
               <span className="truncate">{booking.guestPhone || 'Không có'}</span>
             </p>
          </div>
        </div>

        {/* Footer: Amount */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="flex items-center gap-1 text-[11px] font-semibold text-secondary-500">
              <CreditCard className="h-3 w-3" />
              {methodLabel || 'Chưa có PTTT'}
            </p>
          </div>
          <div className="text-right">
             <p className="text-lg font-black text-foreground">{formatCurrency(booking.finalAmount)}</p>
          </div>
        </div>
      </div>

      {/* --- Desktop View (>= md) --- */}
      <div className="hidden items-center gap-4 md:grid md:grid-cols-[minmax(220px,1.2fr)_minmax(150px,1fr)_minmax(180px,1fr)_minmax(140px,1fr)_minmax(120px,0.8fr)_40px] md:px-5 md:py-4">
        {/* Col 1: Guest Info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 text-xs font-black text-primary-700 transition-colors group-hover:bg-primary-100">
            {initials || <UserRound className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-black leading-tight text-foreground">{guestName}</h4>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-secondary-500">
               <Phone className="h-3 w-3 shrink-0 text-secondary-400" />
               <span className="truncate">{booking.guestPhone || 'Không có SĐT'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Room & Code */}
        <div className="min-w-0">
           <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
             <BedDouble className="h-4 w-4 shrink-0 text-secondary-400" />
             <span className="truncate">{booking.roomName}</span>
           </p>
           <div className="mt-1 flex items-center gap-2">
             <span className="inline-flex items-center gap-1 rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-bold text-secondary-500">
               <Hash className="h-2.5 w-2.5" />
               {booking.bookingCode}
             </span>
             <span className="text-[10px] font-semibold text-secondary-400">{createdAgo}</span>
           </div>
        </div>

        {/* Col 3: Time */}
        <div className="min-w-0">
           <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-foreground">{checkInTime}</span>
              <span className="text-xs text-secondary-400">→</span>
              <span className="text-sm font-black text-foreground">{checkOutTime}</span>
           </div>
           <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-secondary-500">
             <CalendarClock className="h-3 w-3 text-secondary-400" />
             {bookingDate}
           </p>
        </div>

        {/* Col 4: Status & Payment */}
        <div className="min-w-0 space-y-1.5">
           <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', s.dot)} />
              <span className={cn('text-xs font-bold', s.text)}>
                 {s.label}
              </span>
           </div>
           <p className="flex items-center gap-1.5 text-xs text-secondary-600">
             <CreditCard className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
             <span className="truncate font-medium">{methodLabel || 'Chưa có'}</span>
           </p>
        </div>

        {/* Col 5: Amount */}
        <div className="min-w-0 text-right">
          <p className="truncate text-base font-black text-foreground">{formatCurrency(booking.finalAmount)}</p>
        </div>

        {/* Col 6: Action */}
        <div className="flex justify-end">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary-300 transition-all group-hover:text-accent-600">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
