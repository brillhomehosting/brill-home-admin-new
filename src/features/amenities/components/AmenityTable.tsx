import { useMemo } from 'react';
import { Trash2, Pencil, Package, Loader2 } from 'lucide-react';
import { Button, DynamicIcon } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
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

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
            <tr>
              <th scope="col" className="px-5 py-4 w-16">Biểu tượng</th>
              <th scope="col" className="px-5 py-4">Tên tiện nghi</th>
              <th scope="col" className="px-5 py-4">Mô tả</th>
              <th scope="col" className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-secondary-500">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-secondary-500 font-medium">
                  Chưa có tiện nghi nào.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors group cursor-pointer" onClick={() => onEdit(item)}>
                  <td className="px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 group-hover:bg-white transition-all">
                      <DynamicIcon
                        name={item.icon}
                        className="h-5 w-5"
                        fallback={<Package className="h-4 w-4" />}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-foreground">{item.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-secondary-500 max-w-xs truncate block">
                      {item.description || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-secondary-400 hover:text-accent-500 hover:bg-accent-50 rounded transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-secondary-400 hover:text-danger-500 hover:bg-danger-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-border">
        {loading ? (
          <div className="px-5 py-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-secondary-500 text-sm">
            Chưa có tiện nghi nào.
          </div>
        ) : (
          filtered.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-3 px-4 py-4 hover:bg-secondary-50 active:bg-secondary-100 transition-colors cursor-pointer"
              onClick={() => onEdit(item)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <DynamicIcon
                  name={item.icon}
                  className="h-5 w-5"
                  fallback={<Package className="h-4 w-4" />}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                <p className="text-xs text-secondary-500 truncate">{item.description || 'Không có mô tả'}</p>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-secondary-400"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-2 text-danger-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
