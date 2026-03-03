import { useState, useMemo, useCallback, useEffect } from 'react';
import { Check, Star, Package, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button, DynamicIcon } from '@/shared/components/ui';
import { useAmenities } from '@/features/amenities/hooks/useAmenities';
import type { Amenity, RoomAmenity } from '@/shared/types';

// ================================================================
// RoomAmenityManager — checkbox grid to assign/remove amenities
//   + toggle highlight per amenity
//   + "Save" flushes the full replacement list to the server
// ================================================================

type SelectedAmenity = {
  amenityId: string;
  isHighlight: boolean;
};

type RoomAmenityManagerProps = {
  /** Current room amenities (from room detail). */
  roomAmenities: RoomAmenity[];
  /** Called with the complete amenity list when user clicks Save. */
  onSave: (amenities: SelectedAmenity[]) => void;
  /** Mutation pending state. */
  isSaving?: boolean;
};

export function RoomAmenityManager({
  roomAmenities,
  onSave,
  isSaving = false,
}: RoomAmenityManagerProps) {
  const { data: allAmenities = [], isLoading } = useAmenities();

  // ── Build initial selection from room amenities ──
  const buildInitial = useCallback((): Map<string, boolean> => {
    const m = new Map<string, boolean>();
    roomAmenities.forEach((ra) => {
      m.set(ra.id, ra.isHighlight ?? false);
    });
    return m;
  }, [roomAmenities]);

  // Map<amenityId, isHighlight>
  const [selection, setSelection] = useState<Map<string, boolean>>(() =>
    buildInitial(),
  );

  // Sync when room amenities arrive / change
  useEffect(() => {
    setSelection(buildInitial());
  }, [buildInitial]);

  // ── Toggle an amenity on/off ──
  const toggle = (amenityId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      if (next.has(amenityId)) {
        next.delete(amenityId);
      } else {
        next.set(amenityId, false);
      }
      return next;
    });
  };

  // ── Toggle highlight ──
  const toggleHighlight = (amenityId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      if (next.has(amenityId)) {
        next.set(amenityId, !next.get(amenityId));
      }
      return next;
    });
  };

  // ── Dirty check ──
  const isDirty = useMemo(() => {
    const initial = buildInitial();
    if (selection.size !== initial.size) return true;
    for (const [id, highlight] of selection) {
      if (!initial.has(id) || initial.get(id) !== highlight) return true;
    }
    return false;
  }, [selection, buildInitial]);

  // ── Save handler ──
  const handleSave = () => {
    const list: SelectedAmenity[] = [];
    for (const [amenityId, isHighlight] of selection) {
      list.push({ amenityId, isHighlight });
    }
    onSave(list);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-secondary-400" />
        <span className="ml-2 text-sm text-secondary-400">
          Đang tải tiện nghi...
        </span>
      </div>
    );
  }

  if (allAmenities.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center text-secondary-400">
        <Package className="mb-2 h-8 w-8" />
        <p className="text-sm">Chưa có tiện nghi nào trong hệ thống.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Amenity grid ── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {allAmenities.map((amenity: Amenity) => {
          const isSelected = selection.has(amenity.id);
          const isHighlight = selection.get(amenity.id) ?? false;

          return (
            <div
              key={amenity.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors cursor-pointer select-none',
                isSelected
                  ? 'border-primary-300 bg-primary-50/60'
                  : 'border-border bg-white hover:bg-secondary-50',
              )}
              onClick={() => toggle(amenity.id)}
            >
              {/* Checkbox indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-secondary-300 bg-white',
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>

              {/* Icon */}
              <DynamicIcon
                name={amenity.icon}
                className={cn(
                  'h-4 w-4 shrink-0',
                  isSelected ? 'text-primary-500' : 'text-secondary-400',
                )}
                fallback={<Package className="h-4 w-4" />}
              />

              {/* Name */}
              <span
                className={cn(
                  'flex-1 text-sm',
                  isSelected
                    ? 'font-medium text-foreground'
                    : 'text-secondary-600',
                )}
              >
                {amenity.name}
              </span>

              {/* Highlight toggle (only when selected) */}
              {isSelected && (
                <button
                  type="button"
                  title="Đánh dấu nổi bật"
                  className={cn(
                    'rounded p-1 transition-colors',
                    isHighlight
                      ? 'text-warning-500'
                      : 'text-secondary-300 hover:text-warning-400',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHighlight(amenity.id);
                  }}
                >
                  <Star
                    className="h-4 w-4"
                    fill={isHighlight ? 'currentColor' : 'none'}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-secondary-400">
          {selection.size} / {allAmenities.length} tiện nghi được chọn
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={isSaving}
          disabled={!isDirty}
        >
          Lưu tiện nghi
        </Button>
      </div>
    </div>
  );
}
