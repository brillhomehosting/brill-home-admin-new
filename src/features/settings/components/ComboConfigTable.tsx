import { Pencil, Loader2, Layers } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/utils';
import type { ComboConfig } from '@/shared/types';

type ComboConfigTableProps = {
  configs: ComboConfig[];
  loading?: boolean;
  togglingId?: string | null;
  onEdit: (config: ComboConfig) => void;
  onToggle: (config: ComboConfig) => void;
};

export function ComboConfigTable({
  configs,
  loading = false,
  togglingId = null,
  onEdit,
  onToggle,
}: ComboConfigTableProps) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
            <tr>
              <th scope="col" className="px-5 py-4">Min Slots</th>
              <th scope="col" className="px-5 py-4">% Giảm giá</th>
              <th scope="col" className="px-5 py-4">Giảm cố định</th>
              <th scope="col" className="px-5 py-4">Trạng thái</th>
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
                  Chưa có cấu hình combo nào.
                </td>
              </tr>
            ) : (
              configs.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-secondary-50/50 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-foreground">{item.minSlots} slots</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-accent-600">{item.percentageDiscount}%</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-foreground">{formatCurrency(item.flatDiscount)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onToggle(item)}
                      disabled={togglingId === item.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase transition-all',
                        item.isActive
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200',
                        togglingId === item.id && 'opacity-60 cursor-not-allowed',
                      )}
                    >
                      {togglingId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className={cn('h-1.5 w-1.5 rounded-full', item.isActive ? 'bg-emerald-500' : 'bg-secondary-400')} />
                      )}
                      {item.isActive ? 'Đang hoạt động' : 'Tắt'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-secondary-400 hover:text-accent-500 hover:bg-accent-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
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
            Chưa có cấu hình combo nào.
          </div>
        ) : (
          configs.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary-50 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100 shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-sm leading-none mb-1">
                  {item.minSlots} slots
                </p>
                <div className="flex items-center gap-2 text-xs text-secondary-500">
                  <span className="font-semibold text-accent-600">{item.percentageDiscount}%</span>
                  <span>·</span>
                  <span>{formatCurrency(item.flatDiscount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggle(item)}
                  disabled={togglingId === item.id}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[9px] font-bold uppercase transition-all',
                    item.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-secondary-100 text-secondary-500',
                    togglingId === item.id && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {item.isActive ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-secondary-400 hover:text-primary-600 active:scale-90 transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
