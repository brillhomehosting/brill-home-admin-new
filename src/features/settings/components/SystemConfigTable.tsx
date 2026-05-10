import { Pencil, Trash2, Loader2, Settings2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { SystemConfig } from '@/shared/types';

type SystemConfigTableProps = {
  configs: SystemConfig[];
  loading?: boolean;
  onEdit: (config: SystemConfig) => void;
  onDelete: (config: SystemConfig) => void;
};

export function SystemConfigTable({
  configs,
  loading = false,
  onEdit,
  onDelete,
}: SystemConfigTableProps) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
            <tr>
              <th scope="col" className="px-5 py-4">Config Key</th>
              <th scope="col" className="px-5 py-4">Giá trị</th>
              <th scope="col" className="px-5 py-4">Mô tả</th>
              <th scope="col" className="px-5 py-4">Loại</th>
              <th scope="col" className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-secondary-500">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-secondary-500 font-medium">
                  Chưa có cấu hình nào.
                </td>
              </tr>
            ) : (
              configs.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-secondary-50/50 transition-colors group cursor-pointer"
                  onClick={() => onEdit(item)}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                      {item.configKey}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-foreground max-w-[200px] truncate block">
                      {item.configValue}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-secondary-500 max-w-xs truncate block">
                      {item.description || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {item.isSystemDefined && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                          Hệ thống
                        </span>
                      )}
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                          item.isPublic
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-secondary-100 text-secondary-600',
                        )}
                      >
                        {item.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-secondary-400 hover:text-accent-500 hover:bg-accent-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => !item.isSystemDefined && onDelete(item)}
                        disabled={item.isSystemDefined}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          item.isSystemDefined
                            ? 'text-secondary-300 cursor-not-allowed'
                            : 'text-secondary-400 hover:text-danger-500 hover:bg-danger-50',
                        )}
                        title={
                          item.isSystemDefined
                            ? 'Không thể xóa cấu hình hệ thống'
                            : 'Xóa'
                        }
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
      <div className="md:hidden divide-y divide-border w-full overflow-x-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
          </div>
        ) : configs.length === 0 ? (
          <div className="px-5 py-10 text-center text-secondary-500 text-sm">
            Chưa có cấu hình nào.
          </div>
        ) : (
          configs.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-secondary-50 active:bg-secondary-100 transition-colors cursor-pointer"
              onClick={() => onEdit(item)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100 shadow-sm">
                <Settings2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-bold text-secondary-700 bg-secondary-100 inline-block px-1.5 py-0.5 rounded mb-1">
                  {item.configKey}
                </p>
                <p className="text-sm font-medium text-foreground truncate leading-none mb-1">
                  {item.configValue}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {item.isSystemDefined && (
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-100 text-amber-700">
                      Hệ thống
                    </span>
                  )}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase',
                      item.isPublic
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-secondary-100 text-secondary-600',
                    )}
                  >
                    {item.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <div
                className="flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-secondary-400 hover:text-primary-600 active:scale-90 transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => !item.isSystemDefined && onDelete(item)}
                  disabled={item.isSystemDefined}
                  className={cn(
                    'p-2 transition-all',
                    item.isSystemDefined
                      ? 'text-secondary-200 cursor-not-allowed'
                      : 'text-secondary-400 hover:text-danger-500 active:scale-90',
                  )}
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
