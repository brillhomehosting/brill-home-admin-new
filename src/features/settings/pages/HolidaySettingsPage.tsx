import { useState, useEffect } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination, Select } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { HolidayDialog } from '../components/HolidayDialog';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency } from '@/shared/utils';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CalendarRange,
  Loader2,
  AlertTriangle,
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
        onSettled: () => {
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
          { label: 'Ngày lễ' },
        ]}
        actions={
          <Button
            onClick={handleCreate}
            className="bg-accent-400 hover:bg-accent-500"
            icon={Plus}
          >
            Thêm ngày lễ
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        {/* Table Section */}
        {/* --- Filters Section --- */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="flex flex-col gap-1.5 w-full sm:w-72">
                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Loại ngày lễ</label>
                <Select
                  value={holidayType || ''}
                  onChange={(e) => {
                    setHolidayType((e.target.value as HolidayType) || undefined);
                    setPage(0);
                  }}
                  options={[
                    { value: '', label: 'Tất cả loại' },
                    { value: 'ANNUAL', label: 'Hằng năm' },
                    { value: 'SPECIFIC_YEAR', label: 'Cụ thể' },
                  ]}
                  className="h-10 !text-secondary-950"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 w-full">
                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Tìm Tên ngày lễ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm font-medium outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 !text-secondary-950"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="flex items-center justify-between sm:justify-end gap-3 px-1 sm:px-0 py-2">
             <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider px-3">
               Tổng số: {totalElements}
             </span>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4">Tên ngày lễ</th>
                  <th scope="col" className="px-5 py-4">Thời gian</th>
                  <th scope="col" className="px-5 py-4">Phân loại</th>
                  <th scope="col" className="px-5 py-4">Phụ thu</th>
                  <th scope="col" className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-secondary-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : holidays.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-secondary-500 font-medium">
                      Chưa có ngày lễ nào được thiết lập.
                    </td>
                  </tr>
                ) : (
                  holidays.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <CalendarRange className="h-4 w-4 text-secondary-400" />
                          {item.name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col text-sm text-secondary-600">
                          <span className="text-secondary-400 text-xs">Từ: <span className="text-secondary-600 font-medium">{item.startDay}</span></span>
                          <span className="text-secondary-400 text-xs">Đến: <span className="text-secondary-600 font-medium">{item.endDay}</span></span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                            item.holidayType === 'ANNUAL'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {item.holidayType === 'ANNUAL' ? 'Hằng năm' : 'Năm cụ thể'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-accent-600">
                          {item.surchargeType === 'AMOUNT'
                            ? formatCurrency(item.surchargeAmount)
                            : `${item.surchargePercent}%`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-secondary-400 hover:text-accent-500 hover:bg-accent-50 rounded transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
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
            {isLoading ? (
              <div className="px-5 py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
              </div>
            ) : holidays.length === 0 ? (
              <div className="px-5 py-10 text-center text-secondary-500 text-sm">
                Chưa có ngày lễ nào.
              </div>
            ) : (
              holidays.map((item) => (
                <div 
                  key={item.id} 
                  className="flex flex-col p-3.5 gap-2.5 bg-surface hover:bg-secondary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarRange className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                      <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[8px] font-bold uppercase shrink-0',
                        item.holidayType === 'ANNUAL' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      )}
                    >
                      {item.holidayType === 'ANNUAL' ? 'Hằng năm' : 'Năm cụ thể'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] text-secondary-400 font-medium">Lịch:</span>
                       <span className="text-[10px] font-bold text-secondary-600">
                         {item.startDay} - {item.endDay}
                       </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] text-secondary-400 font-medium">Phụ thu:</span>
                       <span className="text-xs font-black text-accent-600">
                         {item.surchargeType === 'AMOUNT' ? formatCurrency(item.surchargeAmount) : `${item.surchargePercent}%`}
                       </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
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
            <span className="font-bold">Xác nhận xóa</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-danger-500 text-white hover:bg-danger-600" onClick={executeDelete} loading={remove.isPending}>
              Xóa xác nhận
            </Button>
          </>
        }
      >
        <p className="text-secondary-700 text-sm leading-relaxed">
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
