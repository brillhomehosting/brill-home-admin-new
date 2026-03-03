import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Upload, Trash2, AlertCircle, X, Save, ImagePlus } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button, ConfirmDialog } from '@/shared/components/ui';
import { useSaveNewImages, useDeleteRoomImage } from '../hooks/useRoomMutation';
import type { RoomImage } from '@/shared/types';
import { MESSAGES } from '@/shared/constants';

// ================================================================
// RoomImageManager — deferred upload flow
//   • File select → local preview only (no upload)
//   • "Lưu" → upload files → addRoomImages (rollback on failure)
//   • Delete → confirm modal → deleteRoomImage + cleanup
// ================================================================

type PendingImage = {
  id: string;        // local temp id
  file: File;
  previewUrl: string; // object URL for preview
};

type RoomImageManagerProps = {
  roomId: string;
  images: RoomImage[];
};

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp';

let nextTempId = 0;
function tempId() {
  return `__pending_${++nextTempId}`;
}

export function RoomImageManager({ roomId, images }: RoomImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Pending (local-only) images ──
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // ── Delete confirmation ──
  const [deleteTarget, setDeleteTarget] = useState<RoomImage | null>(null);

  const saveMutation = useSaveNewImages();
  const deleteMutation = useDeleteRoomImage();

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const hasPending = pendingImages.length > 0;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── All images for display (server + pending) ──
  const allImages = useMemo(() => {
    const serverImgs = images.map((img, idx) => ({
      type: 'server' as const,
      key: img.id,
      src: img.url,
      index: idx + 1,
      data: img,
    }));
    const pendingImgs = pendingImages.map((p, idx) => ({
      type: 'pending' as const,
      key: p.id,
      src: p.previewUrl,
      index: images.length + idx + 1,
      data: p,
    }));
    return [...serverImgs, ...pendingImgs];
  }, [images, pendingImages]);

  // ── Add files to pending (local preview only) ──
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError(null);

      const newPending: PendingImage[] = [];
      Array.from(fileList).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        if (file.size > MAX_SIZE_BYTES) {
          setError(MESSAGES.VALIDATION.FILE_TOO_LARGE(MAX_SIZE_MB));
          return;
        }
        newPending.push({
          id: tempId(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      });

      if (newPending.length > 0) {
        setPendingImages((prev) => [...prev, ...newPending]);
      }

      if (inputRef.current) inputRef.current.value = '';
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  // ── Remove a pending image (local, no API) ──
  const removePending = useCallback((pendingId: string) => {
    setPendingImages((prev) => {
      const found = prev.find((p) => p.id === pendingId);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== pendingId);
    });
  }, []);

  // ── Save: upload pending files → add to room → rollback on failure ──
  const handleSave = useCallback(() => {
    if (!hasPending) return;
    setError(null);

    const files = pendingImages.map((p) => p.file);
    saveMutation.mutate(
      { roomId, files },
      {
        onSuccess: () => {
          // Revoke all preview URLs
          pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
          setPendingImages([]);
          setSuccessMsg('Đã lưu hình ảnh thành công');
        },
        onError: () => {
          setError('Lưu hình ảnh thất bại. Vui lòng thử lại.');
        },
      },
    );
  }, [roomId, pendingImages, hasPending, saveMutation]);

  // ── Delete server image (after confirmation) ──
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { roomId, imageId: deleteTarget.id, imageUrl: deleteTarget.url },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          setSuccessMsg('Đã xóa hình ảnh');
        },
        onError: () => {
          setDeleteTarget(null);
          setError('Xóa hình ảnh thất bại');
        },
      },
    );
  }, [roomId, deleteTarget, deleteMutation]);

  return (
    <div className="flex flex-col gap-4">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          'border-border hover:border-accent-400 hover:bg-accent-50/30',
          isSaving && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="h-8 w-8 text-secondary-400" />
        <p className="text-sm font-medium text-secondary-600">
          Nhấp hoặc kéo hình ảnh vào đây
        </p>
        <p className="text-xs text-secondary-400">
          JPG, PNG, GIF, WebP — tối đa {MAX_SIZE_MB}MB
        </p>
      </div>

      {/* Image grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {allImages.map((item) => (
            <div
              key={item.key}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border',
                item.type === 'pending'
                  ? 'border-accent-300 ring-2 ring-accent-200'
                  : 'border-border',
              )}
            >
              <img
                src={item.src}
                alt={`Hình ${item.index}`}
                className="h-full w-full object-cover"
              />

              {/* Index badge */}
              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-semibold text-white">
                {item.index}
              </span>

              {/* Pending badge */}
              {item.type === 'pending' && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-accent-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <ImagePlus className="h-3 w-3" />
                  Mới
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {item.type === 'server' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(item.data as RoomImage)}
                  >
                    Xóa
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={X}
                    onClick={() => removePending((item.data as PendingImage).id)}
                  >
                    Bỏ
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save bar — only shown when there are pending images */}
      {hasPending && (
        <div className="flex items-center justify-between rounded-lg border border-accent-200 bg-accent-50 px-4 py-3">
          <p className="text-sm text-accent-700">
            <span className="font-semibold">{pendingImages.length}</span> hình
            ảnh mới chưa được lưu
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                setPendingImages([]);
              }}
              disabled={isSaving}
            >
              Hủy tất cả
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
              loading={isSaving}
            >
              Lưu hình ảnh
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa hình ảnh"
        message="Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
