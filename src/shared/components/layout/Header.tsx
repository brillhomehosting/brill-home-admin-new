import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/shared/utils';
import { SidebarContext } from './SidebarContext';

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

type HeaderProps = {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export function Header({ title, breadcrumbs, actions }: HeaderProps) {
  const sidebar = useContext(SidebarContext);

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile hamburger */}
        {sidebar && (
          <button
            type="button"
            onClick={sidebar.toggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-foreground lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}
        {/* Page title */}
        <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
          {title}
        </h1>
        </div>
      </div>

      {/* Right-side actions */}
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-1 flex items-center gap-1 text-xs text-secondary-400">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3 w-3 text-secondary-300" />}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className={cn(
                  'transition-colors hover:text-primary-600',
                  isLast ? 'font-medium text-foreground' : '',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && 'font-medium text-secondary-600')}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
