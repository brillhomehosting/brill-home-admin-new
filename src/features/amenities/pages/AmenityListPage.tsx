import { useState, useCallback } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES, MESSAGES } from '@/shared/constants';
import { useAmenities } from '../hooks/useAmenities';
import {
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
} from '../hooks/useAmenityMutations';
import { AmenityTable } from '../components/AmenityTable';
import { AmenityFormModal } from '../components/AmenityFormModal';
import type { Amenity } from '@/shared/types';
import { Plus, Search } from 'lucide-react';

export default function AmenityListPage() {
  // ── Data fetching ──
  const { data: amenities = [], isLoading } = useAmenities();

  // ── Mutations ──
  const createMutation = useCreateAmenity();
  const updateMutation = useUpdateAmenity();
  const deleteMutation = useDeleteAmenity();

  // ── Local UI state ──
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);

  // ── Handlers ──
  const handleAdd = useCallback(() => {
    setEditingAmenity(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingAmenity(undefined);
  }, []);

  const handleFormSubmit = useCallback(
    (payload: Partial<Amenity>) => {
      if (editingAmenity) {
        updateMutation.mutate(
          { id: editingAmenity.id, data: payload },
          { onSuccess: handleFormClose },
        );
      } else {
        createMutation.mutate(payload as Pick<Amenity, 'name'> & Partial<Amenity>, {
          onSuccess: handleFormClose,
        });
      }
    },
    [editingAmenity, updateMutation, createMutation, handleFormClose],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Tiện nghi"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Tiện nghi' },
        ]}
        actions={
          <Button icon={Plus} onClick={handleAdd} className="bg-primary-600 hover:bg-primary-700 shadow-sm h-10 px-3 sm:px-4">
            <span className="hidden sm:inline">Thêm tiện nghi</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6 min-w-0">
        {/* --- Filters Section --- */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex flex-col gap-1.5 w-full sm:max-w-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Tìm tiện nghi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm font-medium outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 !text-secondary-950"
              />
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden max-w-full">
          <div className="flex items-center justify-between sm:justify-end gap-3 px-1 sm:px-0 py-2 bg-surface/50">
             <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider px-3">
               Tổng số: {amenities.length}
             </span>
          </div>

          <AmenityTable
            amenities={amenities}
            loading={isLoading}
            searchTerm={search}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      </PageWrapper>

      {/* ── Create / Edit modal ── */}
      <AmenityFormModal
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        amenity={editingAmenity}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa tiện nghi"
        message={
          deleteTarget
            ? `${MESSAGES.AMENITIES.DELETE_CONFIRM} "${deleteTarget.name}"`
            : MESSAGES.AMENITIES.DELETE_CONFIRM
        }
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
