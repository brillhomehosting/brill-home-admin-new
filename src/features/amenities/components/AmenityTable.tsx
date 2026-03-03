import { useMemo } from 'react';
import { Trash2, Pencil, Package } from 'lucide-react';
import { Table, type Column, Button, DynamicIcon } from '@/shared/components/ui';
import type { Amenity } from '@/shared/types';

type AmenityTableProps = {
  amenities: Amenity[];
  loading?: boolean;
  searchTerm?: string;
  onEdit: (amenity: Amenity) => void;
  onDelete: (amenity: Amenity) => void;
};

export function AmenityTable({
  amenities,
  loading = false,
  searchTerm = '',
  onEdit,
  onDelete,
}: AmenityTableProps) {
  // ── Client-side search ──
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return amenities;
    const lower = searchTerm.toLowerCase();
    return amenities.filter(
      (a) =>
        a.name?.toLowerCase().includes(lower) ||
        a.description?.toLowerCase().includes(lower),
    );
  }, [amenities, searchTerm]);

  // ── Column definitions ──
  const columns: Column<Amenity>[] = useMemo(
    () => [
      {
        key: 'icon',
        header: 'Biểu tượng',
        className: 'w-16',
        render: (row) => (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
            <DynamicIcon
              name={row.icon}
              className="h-5 w-5"
              fallback={<Package className="h-4 w-4" />}
            />
          </div>
        ),
      },
      {
        key: 'name',
        header: 'Tên',
        sortable: true,
        render: (row) => (
          <button
            type="button"
            className="text-sm font-medium text-primary-600 hover:underline"
            onClick={() => onEdit(row)}
          >
            {row.name}
          </button>
        ),
      },
      {
        key: 'description',
        header: 'Mô tả',
        render: (row) => (
          <span className="max-w-xs truncate text-sm text-secondary-500">
            {row.description || '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24 text-right',
        headerClassName: 'text-right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={Pencil}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-danger-500 hover:bg-danger-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
            />
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <Table<Amenity>
      columns={columns}
      data={filtered}
      loading={loading}
      emptyMessage="Chưa có tiện nghi nào"
      emptyIcon={<Package className="h-10 w-10 text-secondary-300" />}
      rowKey={(row) => row.id}
      onRowClick={(row) => onEdit(row)}
    />
  );
}
