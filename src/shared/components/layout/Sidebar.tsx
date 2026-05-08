import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Receipt,
  Settings,
  LogOut,
  Package,
  Tag,
  CalendarRange,
  X,
  PackageOpen,
  Database,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/shared/contexts/AuthContext';

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  title?: string;
  items: NavItem[];
};

const navigation: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', path: ROUTES.HOME, icon: LayoutDashboard },
      { label: 'Phòng', path: ROUTES.ROOMS, icon: BedDouble },
      { label: 'Tiện nghi', path: ROUTES.AMENITIES_LIST, icon: Package },
      { label: 'Đặt phòng', path: ROUTES.BOOKINGS.LIST, icon: CalendarCheck },
      { label: 'Hóa đơn', path: ROUTES.INVOICES, icon: Receipt },
      { label: 'Giảm giá', path: ROUTES.DISCOUNTS, icon: Tag },
      { label: 'Ngày lễ', path: ROUTES.HOLIDAYS, icon: CalendarRange },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'System Configs', path: ROUTES.SETTINGS, icon: Settings },
      { label: 'Combo Configs', path: '/settings/combo-configs', icon: PackageOpen },
      { label: 'Cache Data', path: '/settings/caches', icon: Database },
    ],
  },
];

// ── Sidebar component ──
type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.SIGN_IN, { replace: true });
  };

  const handleNavClick = () => {
    // Close drawer on mobile after navigating
    onClose?.();
  };

  const displayName = user?.name || 'Admin User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[201] flex w-60 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:z-sticky lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400 text-sm font-bold text-white">
          B
        </div>
        <span className="text-base font-semibold text-white tracking-tight">
          Brill Home Stay
        </span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
        {navigation.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="mb-2 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                currentPath={location.pathname}
                onClick={handleNavClick}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-3 py-2">
        <SidebarLink
          item={{ label: 'Hồ sơ cá nhân', path: '/profile', icon: User }}
          currentPath={location.pathname}
          onClick={handleNavClick}
        />
        <div className="mt-2" />

        {/* User info */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-500 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-secondary-400">Quản trị viên</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md p-1 text-secondary-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}

// ── Single nav link ──
function SidebarLink({
  item,
  currentPath,
  onClick,
}: {
  item: NavItem;
  currentPath: string;
  onClick?: () => void;
}) {
  const isActive = item.exact
    ? currentPath === item.path
    : item.path === '/'
    ? currentPath === '/'
    : currentPath.startsWith(item.path);

  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-active/15 text-sidebar-active'
          : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-white',
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          isActive ? 'text-sidebar-active' : 'text-secondary-400 group-hover:text-white',
        )}
      />
      {item.label}
    </NavLink>
  );
}
