import { useState, useMemo, useEffect } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui';
import { Modal } from '@/shared/components/ui/Modal';
import { HolidayDialog } from '../components/HolidayDialog';
import { ROUTES } from '@/shared/constants';
import { cn, formatDate } from '@/shared/utils';
import {
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Settings2,
  CalendarRange,
  Loader2,
} from 'lucide-react';
import { useHolidays, useHolidayMutations } from '../hooks/useHolidays';
import type { Holiday, HolidayType } from '@/shared/types';

export default function HolidaySettingsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [holidayType, setHolidayType] = useState<HolidayType | undefined>(undefined);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  // Delete Confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // API Hooks
  const { data: response, isLoading } = useHolidays({
    page,
    size,
    name: debouncedSearch,
    holidayType,
  });

  const { remove } = useHolidayMutations();

  const holidays = response?.content || [];
  const totalElements = response?.totalElements || 0;
  const totalPages = response?.totalPages || 0;

  const handleCreate = () => {
    setSelectedHoliday(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (holidayToDelete) {
      remove.mutate(holidayToDelete.id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setHolidayToDelete(null);
        }
      });
    }
  };

  const handleDialogSuccess = () => {};

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Danh sách ngày lễ"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Cấu hình' },
          { label: 'Phụ thu ngày lễ' },
        ]}
        actions={
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-500"
          >
            <Plus className="h-4 w-4" />
            Thêm ngày lễ
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        
        {/* Settings Block Header (Story 13 mock) */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Cấu hình mức phụ thu Lễ/Tết</h2>
              <p className="mt-0.5 text-sm text-secondary-500">
                Tự động cộng thêm phụ thu cho các booking vào những ngày thuộc danh sách bên dưới.
              </p>
            </div>
          </div>
          <Button variant="secondary" className="border-border text-secondary-700 bg-secondary-50 font-semibold px-6 hover:bg-secondary-100">
            Thiết lập mức giá
          </Button>
        </div>

        {/* Table Section */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
          {/* Filters */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative w-48 shrink-0">
                <select 
                  value={holidayType || ''}
                  onChange={(e) => {
                    setHolidayType((e.target.value as HolidayType) || undefined);
                    setPage(0);
                  }}
                  className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500"
                >
                  <option value="">Phân loại: Tất cả</option>
                  <option value="ANNUAL">Hằng năm</option>
                  <option value="SPECIFIC_YEAR">Năm cụ thể</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>

              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm Tên ngày lễ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4">Tên ngày lễ</th>
                  <th scope="col" className="px-5 py-4">Ngày bắt đầu</th>
                  <th scope="col" className="px-5 py-4">Ngày kết thúc</th>
                  <th scope="col" className="px-5 py-4">Phân loại</th>
                  <th scope="col" className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-secondary-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        <span>Đang tải danh sách ngày lễ...</span>
                      </div>
                    </td>
                  </tr>
                ) : holidays.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-secondary-500">
                      Chưa có ngày lễ nào được thiết lập.
                    </td>
                  </tr>
                ) : (
                  holidays.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-4 w-4 text-secondary-400" />
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-accent-600">
                        {item.holidayType === 'ANNUAL' 
                          ? formatDate(item.startDay, { day: '2-digit', month: '2-digit' })
                          : formatDate(item.startDay)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-accent-600">
                        {item.holidayType === 'ANNUAL'
                          ? formatDate(item.endDay, { day: '2-digit', month: '2-digit' })
                          : formatDate(item.endDay)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            item.holidayType === 'ANNUAL'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {item.holidayType === 'ANNUAL' ? 'Lặp lại Hằng năm' : 'Theo năm Sự kiện'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-secondary-400 hover:text-accent-500 hover:bg-accent-50 rounded transition-colors"
                            title="Sửa ngày lễ"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 text-secondary-400 hover:text-danger-500 hover:bg-danger-50 rounded transition-colors"
                            title="Xóa ngày lễ"
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

          {/* Pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
              summary={`Hiển thị ${holidays.length} / ${totalElements} kết quả`}
            />
          </div>
        </div>
      </PageWrapper>

      {/* Form Dialog */}
      <HolidayDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialData={selectedHoliday}
        onSuccess={handleDialogSuccess}
      />

      {/* Confirm Delete Dialog */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-danger-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold">Xóa ngày lễ này?</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-danger-500 text-white hover:bg-danger-600" onClick={executeDelete}>
              Xóa xác nhận
            </Button>
          </>
        }
      >
        <p className="text-secondary-700 text-sm">
          Bạn có chắc chắn muốn xóa hệ thống phụ thu cho ngày <strong className="text-foreground">{holidayToDelete?.name}</strong>?
          <br /><br />
          <span className="text-xs text-secondary-500">
            * Cảnh báo: Các booking từ nay trở đi rơi vào thời gian này sẽ không bị áp dụng phụ thu tự động nữa!
          </span>
        </p>
      </Modal>

    </div>
  );
}
