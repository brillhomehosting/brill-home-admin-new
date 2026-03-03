import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MESSAGES } from '@/shared/constants';
import { Button, ConfirmDialog } from '@/shared/components/ui';
import { useToast } from '@/shared/components/feedback/Toast';
import {
  useTimeSlots,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
} from '../hooks/useTimeSlotCrud';
import { TimeSlotRow } from './TimeSlotRow';
import type { TimeSlot, CreateTimeSlotData } from '@/shared/types';

// ── Constants ──
const TEMP_PREFIX = '_new_';

export type TimeSlotDraft = {
  /** Real id from server, or temp id for unsaved rows */
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  isOvernight: boolean;
  /** Whether this row has never been persisted */
  isNew: boolean;
  /** Whether fields have been changed from the server copy */
  isDirty: boolean;
};

// ================================================================
// TimeSlotManager — full CRUD for time slots inside RoomEdit
// ================================================================

type Props = { roomId: string };

export function TimeSlotManager({ roomId }: Props) {
  const { data: serverSlots = [], isLoading } = useTimeSlots(roomId);
  const createMut = useCreateTimeSlot();
  const updateMut = useUpdateTimeSlot();
  const deleteMut = useDeleteTimeSlot();
  const { toast } = useToast();

  // ── Local draft state (layered over server data) ──
  const [drafts, setDrafts] = useState<TimeSlotDraft[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TimeSlotDraft | null>(null);
  // Track which row is currently being saved (by id)
  const [savingId, setSavingId] = useState<string | null>(null);

  // Merge server data with local drafts:
  // - New rows (temp id) only exist in drafts
  // - Existing rows prefer the draft version if dirty, else server version
  const mergedSlots: TimeSlotDraft[] = [
    // Existing server slots — use draft override if present
    ...serverSlots.map((s) => {
      const draft = drafts.find((d) => d.id === s.id);
      if (draft) return draft;
      return serverToDraft(s);
    }),
    // New (unsaved) rows
    ...drafts.filter((d) => d.isNew),
  ];

  // ── Handlers ──

  const handleAdd = useCallback(() => {
    const id = `${TEMP_PREFIX}${Date.now()}`;
    setDrafts((prev) => [
      ...prev,
      {
        id,
        startTime: '08:00',
        endTime: '09:00',
        price: 0,
        isOvernight: false,
        isNew: true,
        isDirty: true,
      },
    ]);
  }, []);

  const handleFieldChange = useCallback(
    (id: string, field: keyof CreateTimeSlotData, value: unknown) => {
      setDrafts((prev) => {
        const existing = prev.find((d) => d.id === id);
        if (existing) {
          return prev.map((d) =>
            d.id === id ? { ...d, [field]: value, isDirty: true } : d,
          );
        }
        // Create draft from server slot
        const server = serverSlots.find((s) => s.id === id);
        if (!server) return prev;
        return [
          ...prev,
          { ...serverToDraft(server), [field]: value, isDirty: true },
        ];
      });
    },
    [serverSlots],
  );

  const handleCancel = useCallback(
    (id: string) => {
      const draft = drafts.find((d) => d.id === id);
      if (draft?.isNew) {
        // Remove unsaved row entirely
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } else {
        // Revert to server version
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      }
    },
    [drafts],
  );

  const handleSave = useCallback(
    async (draft: TimeSlotDraft) => {
      const payload: CreateTimeSlotData = {
        startTime: draft.startTime,
        endTime: draft.endTime,
        price: draft.price,
        isOvernight: draft.isOvernight,
      };

      setSavingId(draft.id);
      try {
        if (draft.isNew) {
          await createMut.mutateAsync({ roomId, data: payload });
          toast(MESSAGES.TIME_SLOTS.CREATE_SUCCESS, 'success');
        } else {
          await updateMut.mutateAsync({
            roomId,
            timeslotId: draft.id,
            data: payload,
          });
          toast(MESSAGES.TIME_SLOTS.UPDATE_SUCCESS, 'success');
        }
        // Remove from drafts after success (server data will refresh)
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      } catch {
        toast(MESSAGES.ERROR, 'error');
      } finally {
        setSavingId(null);
      }
    },
    [roomId, createMut, updateMut, toast],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    if (deleteTarget.isNew) {
      setDrafts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      return;
    }

    setSavingId(deleteTarget.id);
    try {
      await deleteMut.mutateAsync({
        roomId,
        timeslotId: deleteTarget.id,
      });
      toast(MESSAGES.TIME_SLOTS.DELETE_SUCCESS, 'success');
      setDrafts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      toast(MESSAGES.ERROR, 'error');
    } finally {
      setSavingId(null);
      setDeleteTarget(null);
    }
  }, [deleteTarget, roomId, deleteMut, toast]);

  // Are there any unsaved new rows?
  const hasUnsaved = drafts.some((d) => d.isNew);

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-secondary-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Slot rows */}
      {mergedSlots.length === 0 && !hasUnsaved && (
        <p className="py-6 text-center text-sm text-secondary-400">
          Chưa có khung giờ nào. Nhấn "Thêm khung giờ" để bắt đầu.
        </p>
      )}

      {mergedSlots.map((slot) => (
        <TimeSlotRow
          key={slot.id}
          slot={slot}
          isSaving={savingId === slot.id}
          onChange={handleFieldChange}
          onSave={() => handleSave(slot)}
          onCancel={() => handleCancel(slot.id)}
          onDelete={() => setDeleteTarget(slot)}
        />
      ))}

      {/* Add button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        disabled={hasUnsaved}
        className="w-full border border-dashed border-border hover:border-accent-400 hover:text-accent-600"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Thêm khung giờ
      </Button>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa khung giờ"
        message={MESSAGES.TIME_SLOTS.DELETE_CONFIRM}
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Helpers ──

function serverToDraft(s: TimeSlot): TimeSlotDraft {
  return {
    id: s.id,
    startTime: s.startTime ?? '08:00',
    endTime: s.endTime ?? '09:00',
    price: s.price ?? 0,
    isOvernight: s.isOvernight ?? false,
    isNew: false,
    isDirty: false,
  };
}
