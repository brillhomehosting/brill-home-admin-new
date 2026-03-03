import { useState, useCallback } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { ConfirmDialog } from '@/shared/components/ui';
import { ROUTES, MESSAGES } from '@/shared/constants';
import { useAmenities } from '../hooks/useAmenities';
import {
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
} from '../hooks/useAmenityMutations';
import { AmenityTable } from '../components/AmenityTable';
import { AmenityListHeader } from '../components/AmenityListHeader';
import { AmenityFormModal } from '../components/AmenityFormModal';
import type { Amenity } from '@/shared/types';

// ================================================================
// AmenityListPage — full CRUD page with modal form + confirm delete
// ================================================================

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
    <>
      <Header
        title="Tiện nghi"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Tiện nghi' },
        ]}
      />

      <PageWrapper>
        {/* ── Search + Add button ── */}
        <AmenityListHeader
          searchTerm={search}
          onSearchChange={setSearch}
          onAdd={handleAdd}
        />

        {/* ── Table ── */}
        <div className="mt-4">
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
    </>
  );
}
