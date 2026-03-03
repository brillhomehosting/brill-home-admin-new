import { Plus } from 'lucide-react';
import { Button, SearchInput } from '@/shared/components/ui';

type AmenityListHeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
};

export function AmenityListHeader({
  searchTerm,
  onSearchChange,
  onAdd,
}: AmenityListHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput
        placeholder="Tìm kiếm tiện nghi..."
        value={searchTerm}
        onSearch={onSearchChange}
        debounceMs={300}
        className="w-full sm:max-w-xs"
      />
      <Button icon={Plus} onClick={onAdd}>
        Thêm tiện nghi
      </Button>
    </div>
  );
}
