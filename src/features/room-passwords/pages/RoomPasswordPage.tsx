import { useState } from 'react';
import {
  Key,
  DoorOpen,
  Copy,
  Loader2,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button, Modal } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { useAllRoomPasswords } from '../hooks/useAllRoomPasswords';
import { useSetRoomPassword } from '../hooks/useSetRoomPassword';
import type { RoomPasswordResponse } from '@/shared/types';
import { cn } from '@/shared/utils';

// ================================================================
// RoomPasswordPage — list rooms + current passwords, generate new
// ================================================================

type PasswordModal =
  | null
  | { phase: 'confirm'; room: RoomPasswordResponse }
  | { phase: 'result'; room: RoomPasswordResponse; newPassword: string };

export default function RoomPasswordPage() {
  // ── State ──
  const [mainDoorPassword, setMainDoorPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modal, setModal] = useState<PasswordModal>(null);

  // ── Data ──
  const { data: rooms = [], isLoading } = useAllRoomPasswords();
  const setPasswordMutation = useSetRoomPassword();

  // ── Main door password ──
  const generateMainDoor = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const num = Math.floor(10000 + Math.random() * 90000); // 5 digits
      setMainDoorPassword(`${num}!`);
      setIsGenerating(false);
    }, 300);
  };

  // ── Clipboard ──
  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  // ── Set room password ──
  const handleConfirmPassword = async () => {
    if (modal?.phase !== 'confirm') return;
    const { room } = modal;
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    try {
      await setPasswordMutation.mutateAsync({ roomId: room.id, password: newPassword });
      setModal({ phase: 'result', room, newPassword });
    } catch {
      setModal(null);
    }
  };

  const handleCloseModal = () => {
    if (setPasswordMutation.isPending) return;
    setModal(null);
  };

  return (
    <>
      <Header
        title="Trình tạo mật khẩu"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Mật khẩu phòng' },
        ]}
      />

      <PageWrapper>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ═══════ Room passwords — 2 columns ═══════ */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-card lg:col-span-2 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Key className="h-5 w-5 text-primary-500" />
              Mật khẩu phòng
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-secondary-400" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="py-8 text-center text-sm text-secondary-400">
                Không có phòng nào
              </p>
            ) : (
              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {[...rooms]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((room) => (
                    <RoomPasswordRow
                      key={room.id}
                      room={room}
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                      onChangePassword={(r) => setModal({ phase: 'confirm', room: r })}
                    />
                  ))}
              </div>
            )}
          </section>

          {/* ═══════ Main door password — 1 column ═══════ */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <DoorOpen className="h-5 w-5 text-primary-500" />
              Mật khẩu cửa chính
            </h2>

            <Button
              variant="primary"
              className="w-full justify-start gap-3 py-4"
              onClick={generateMainDoor}
              loading={isGenerating}
              icon={DoorOpen}
            >
              <span className="text-left">
                <span className="block text-sm font-semibold">
                  Tạo mật khẩu cửa chính
                </span>
                <span className="block text-xs opacity-80">5 chữ số + !</span>
              </span>
            </Button>

            {mainDoorPassword && (
              <div className="mt-4 animate-zoom-in">
                <div className="relative overflow-hidden rounded-xl bg-accent-400 p-6 text-center">
                  {/* Pattern overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <span className="relative text-4xl font-bold tracking-widest text-white drop-shadow">
                    {mainDoorPassword}
                  </span>
                </div>

                <div className="mt-3 flex justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Copy}
                    onClick={() => copyToClipboard(mainDoorPassword)}
                  >
                    Sao chép
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </PageWrapper>

      {/* ── Password modal (confirm → result) ── */}
      <PasswordModal
        modal={modal}
        loading={setPasswordMutation.isPending}
        copiedId={copiedId}
        onConfirm={handleConfirmPassword}
        onClose={handleCloseModal}
        onCopy={copyToClipboard}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: single room row
// ────────────────────────────────────────────────────────────────

function RoomPasswordRow({
  room,
  copiedId,
  onCopy,
  onChangePassword,
}: {
  room: RoomPasswordResponse;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onChangePassword: (room: RoomPasswordResponse) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 transition-colors hover:border-primary-200',
      )}
    >
      {/* Left: name + password badge */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {room.name}
        </p>

        {room.currentPassword ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex rounded-md bg-accent-400 px-2 py-0.5 text-xs font-bold tracking-wide text-white">
              {room.currentPassword}
            </span>
            <button
              type="button"
              className="rounded p-0.5 text-secondary-400 transition-colors hover:text-primary-500"
              title="Sao chép"
              onClick={() => onCopy(room.currentPassword!, room.id)}
            >
              {copiedId === room.id ? (
                <Check className="h-3.5 w-3.5 text-success-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ) : (
          <p className="mt-1 text-xs text-secondary-400">Chưa có mật khẩu</p>
        )}
      </div>

      {/* Right: action button */}
      <Button
        variant="secondary"
        size="sm"
        icon={Key}
        onClick={() => onChangePassword(room)}
      >
        {room.currentPassword ? 'Đổi MK' : 'Tạo MK'}
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: confirm → result modal
// ────────────────────────────────────────────────────────────────

function PasswordModal({
  modal,
  loading,
  copiedId,
  onConfirm,
  onClose,
  onCopy,
}: {
  modal: PasswordModal;
  loading: boolean;
  copiedId: string | null;
  onConfirm: () => void;
  onClose: () => void;
  onCopy: (text: string, id: string) => void;
}) {
  if (!modal) return null;

  if (modal.phase === 'confirm') {
    return (
      <Modal
        open
        onClose={onClose}
        title="Xác nhận tạo mật khẩu"
        size="sm"
        closeOnOverlayClick={!loading}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button variant="primary" onClick={onConfirm} loading={loading}>
              Xác nhận
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          Tạo mật khẩu mới cho phòng{' '}
          <span className="font-semibold text-foreground">
            "{modal.room.name}"
          </span>
          ?{' '}
          {modal.room.currentPassword && 'Mật khẩu cũ sẽ bị thay thế.'}
        </p>
      </Modal>
    );
  }

  // phase === 'result'
  const { room, newPassword } = modal;
  return (
    <Modal
      open
      onClose={onClose}
      title="Mật khẩu mới"
      size="sm"
      footer={
        <Button variant="primary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-6 w-6 text-success-500" />
        </div>

        <p className="text-center text-sm text-secondary-500">
          Mật khẩu phòng{' '}
          <span className="font-semibold text-foreground">"{room.name}"</span>{' '}
          đã được cập nhật.
        </p>

        {/* Password display */}
        <div className="relative w-full overflow-hidden rounded-xl bg-accent-400 py-5 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <span className="relative text-3xl font-bold tracking-widest text-white drop-shadow">
            {newPassword}
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={copiedId === room.id ? Check : Copy}
          onClick={() => onCopy(newPassword, room.id)}
        >
          {copiedId === room.id ? 'Đã sao chép' : 'Sao chép'}
        </Button>
      </div>
    </Modal>
  );
}
