import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '@/shared/components/layout';
import { Button, SearchInput, Select } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';

// ================================================================
// RoomListHeader — breadcrumb + title + action buttons + filters
// ================================================================

type RoomListHeaderProps = {
  totalElements: number;
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

export function RoomListHeader({
  totalElements,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
}: RoomListHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-4 bg-surface shadow-sm">
      <Header
        title="Danh sách phòng"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Phòng' },
        ]}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate(ROUTES.ROOM_ADD)}
          >
            Thêm phòng mới
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-3 px-4 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
        <SearchInput
          value={search}
          onSearch={onSearch}
          placeholder="Tìm kiếm phòng..."
          className="w-full sm:w-64"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="w-full sm:w-48"
        />
        <span className="text-sm text-secondary-400 sm:ml-auto">
          {totalElements} phòng
        </span>
      </div>
    </div>
  );
}
