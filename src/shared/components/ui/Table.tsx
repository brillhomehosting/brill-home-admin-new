import type { ReactNode } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

// ── Column definition ──
export type Column<T> = {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
};

// ── Table props ──
type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  rowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  className?: string;
};

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  emptyIcon,
  onSort,
  sortKey,
  sortDir: _sortDir,
  rowKey,
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-surface shadow-card',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Head */}
          <thead>
            <tr className="border-b border-border bg-secondary-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-500',
                    col.sortable && 'cursor-pointer select-none hover:text-secondary-700',
                    col.headerClassName,
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown
                        className={cn(
                          'h-3 w-3',
                          sortKey === col.key
                            ? 'text-primary-500'
                            : 'text-secondary-300',
                        )}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-secondary-400" />
                  <p className="mt-2 text-sm text-secondary-400">Đang tải...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  {emptyIcon && <div className="mb-3 flex justify-center">{emptyIcon}</div>}
                  <p className="text-sm text-secondary-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey(row, idx)}
                  className={cn(
                    'transition-colors hover:bg-secondary-50/50',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-secondary-700', col.className)}
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
