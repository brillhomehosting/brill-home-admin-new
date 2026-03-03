import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional label like "Hiển thị 7 phòng" */
  summary?: string;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  summary,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return summary ? (
      <div className={cn('flex items-center text-sm text-secondary-400', className)}>
        {summary}
      </div>
    ) : null;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={cn('flex flex-col items-center gap-3 sm:flex-row sm:justify-between', className)}>
      {summary && (
        <span className="text-sm text-secondary-400">{summary}</span>
      )}

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-secondary-500 transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-1 text-secondary-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                p === currentPage
                  ? 'bg-accent-400 text-white'
                  : 'border border-border text-secondary-600 hover:bg-secondary-50',
              )}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-secondary-500 transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Generate page numbers with ellipsis.
 * e.g. [1, 2, 3, '...', 10] or [1, '...', 4, 5, 6, '...', 10]
 */
function getPageNumbers(
  current: number,
  total: number,
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}
