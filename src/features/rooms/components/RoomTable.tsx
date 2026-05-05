import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils';
import { Badge } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import type { Room } from '@/shared/types';
import type { ERoomType } from '@/shared/types/enums';

// ── Room-type badge config ──
const ROOM_TYPE_LABEL: Record<string, string> = {
  NORMAL: 'Thường',
  STANDARD: 'Standard',
  VIP: 'VIP',
  PREMIUM: 'Premium',
};

const ROOM_TYPE_BADGE: Record<string, 'NORMAL' | 'STANDARD' | 'VIP' | 'PREMIUM'> = {
  NORMAL: 'NORMAL',
  STANDARD: 'STANDARD',
  VIP: 'VIP',
  PREMIUM: 'PREMIUM',
};

type RoomTableProps = {
  rooms: Room[];
  loading?: boolean;
  onDelete: (room: Room) => void;
  onRestore?: (room: Room) => void;
};

export function RoomTable({ rooms, loading, onDelete, onRestore }: RoomTableProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop table — md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
            <tr>
              <th scope="col" className="px-5 py-4">Hình ảnh</th>
              <th scope="col" className="px-5 py-4">Tên & Loại phòng</th>
              <th scope="col" className="px-5 py-4 text-right">Giá theo giờ</th>
              <th scope="col" className="px-5 py-4 text-right">Giá qua đêm</th>
              <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
              <th scope="col" className="px-5 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    <span className="text-sm text-secondary-500 font-medium">Đang tải danh sách phòng...</span>
                  </div>
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-secondary-500 font-medium">
                  Không có phòng nào
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  onEdit={() => navigate(ROUTES.ROOM_EDIT(room.id))}
                  onDelete={() => onDelete(room)}
                  onRestore={onRestore ? () => onRestore(room) : undefined}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — below md */}
      <div className="md:hidden divide-y divide-border">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-secondary-400">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500 mr-2" />
            Đang tải...
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-secondary-400">
            <p className="text-sm">Không có phòng nào</p>
          </div>
        ) : (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => navigate(ROUTES.ROOM_EDIT(room.id))}
              onDelete={() => onDelete(room)}
              onRestore={onRestore ? () => onRestore(room) : undefined}
            />
          ))
        )}
      </div>
    </>
  );
}

// ── Shared action dropdown ──

function ActionMenu({
  room,
  onEdit,
  onDelete,
  onRestore,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="rounded p-1 text-secondary-400 transition-colors hover:bg-secondary-200 hover:text-secondary-600"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-border bg-surface py-1 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
              onClick={() => { setMenuOpen(false); onEdit(); }}
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </button>
            {room.isActive === false && onRestore ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-secondary-50"
                onClick={() => { setMenuOpen(false); onRestore(); }}
              >
                <RotateCcw className="h-4 w-4" />
                Khôi phục
              </button>
            ) : null}
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
              onClick={() => { setMenuOpen(false); onDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Desktop table row ──

function RoomRow({
  room,
  onEdit,
  onDelete,
  onRestore,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}) {
  const navigate = useNavigate();
  const thumb = room.images?.[0]?.url;
  const typeBadge = ROOM_TYPE_BADGE[(room.roomType as string) ?? 'NORMAL'] ?? 'NORMAL';
  const typeLabel = ROOM_TYPE_LABEL[(room.roomType as string) ?? 'NORMAL'] ?? room.roomType;

  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-secondary-50/50"
      onClick={() => navigate(ROUTES.ROOM_VIEW(room.id))}
    >
      {/* Image */}
      <td className="px-5 py-4">
        <div
          className={cn(
            'h-12 w-12 rounded-lg border border-border bg-secondary-100 bg-cover bg-center',
          )}
          style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
        />
      </td>

      {/* Name & type */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground group-hover:text-accent-500 transition-colors">
            {room.name}
          </span>
          <div>
            <Badge variant={typeBadge as ERoomType}>{typeLabel}</Badge>
          </div>
        </div>
      </td>

      {/* Hourly rate */}
      <td className="px-5 py-4 text-right text-sm font-medium text-foreground">
        {room.hourlyRate != null ? formatCurrency(room.hourlyRate) : '—'}
      </td>

      {/* Overnight rate */}
      <td className="px-5 py-4 text-right text-sm font-medium text-foreground">
        {room.overnightRate != null ? formatCurrency(room.overnightRate) : '—'}
      </td>

      {/* Status */}
      <td className="px-5 py-4 text-center">
        {room.isActive !== false ? (
          <Badge variant="success" dot>
            Hoạt động
          </Badge>
        ) : (
          <Badge variant="danger" dot>
            Ngừng HĐ
          </Badge>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-center">
        <ActionMenu room={room} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
      </td>
    </tr>
  );
}

// ── Mobile card ──

function RoomCard({
  room,
  onEdit,
  onDelete,
  onRestore,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}) {
  const navigate = useNavigate();
  const thumb = room.images?.[0]?.url;
  const typeBadge = ROOM_TYPE_BADGE[(room.roomType as string) ?? 'NORMAL'] ?? 'NORMAL';
  const typeLabel = ROOM_TYPE_LABEL[(room.roomType as string) ?? 'NORMAL'] ?? room.roomType;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-secondary-50/50"
      onClick={() => navigate(ROUTES.ROOM_VIEW(room.id))}
    >
      {/* Thumbnail */}
      <div
        className="h-14 w-14 shrink-0 rounded-lg border border-border bg-secondary-100 bg-cover bg-center"
        style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
      />

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{room.name}</p>
            <div className="mt-0.5">
              <Badge variant={typeBadge as ERoomType}>{typeLabel}</Badge>
            </div>
          </div>
          <div className="shrink-0">
            {room.isActive !== false ? (
              <Badge variant="success" dot>Hoạt động</Badge>
            ) : (
              <Badge variant="danger" dot>Ngừng HĐ</Badge>
            )}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-secondary-500">
          {room.hourlyRate != null && <span>{formatCurrency(room.hourlyRate)}/giờ</span>}
          {room.overnightRate != null && <span>{formatCurrency(room.overnightRate)}/đêm</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0">
        <ActionMenu room={room} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
      </div>
    </div>
  );
}
