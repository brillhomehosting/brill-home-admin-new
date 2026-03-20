import { useState } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui';
import { Modal } from '@/shared/components/ui/Modal';
import { HolidayDialog } from '../components/HolidayDialog';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/utils';
import {
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Settings2,
  CalendarRange
} from 'lucide-react';

// --- Types & Mock Data ---

type HolidayType = 'YEARLY' | 'SPECIFIC_YEAR';

type Holiday = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: HolidayType;
};

const initialHolidays: Holiday[] = [
  { id: 'h1', name: 'Tết Dương lịch', startDate: '01/01', endDate: '01/01', type: 'YEARLY' },
  { id: 'h2', name: 'Tết Âm lịch 2026', startDate: '15/01/2026', endDate: '21/01/2026', type: 'SPECIFIC_YEAR' },
  { id: 'h3', name: 'Giải phóng miền Nam', startDate: '30/04', endDate: '30/04', type: 'YEARLY' },
  { id: 'h4', name: 'Quốc tế Lao động', startDate: '01/05', endDate: '01/05', type: 'YEARLY' },
  { id: 'h5', name: 'Quốc khánh', startDate: '02/09', endDate: '02/09', type: 'YEARLY' },
  { id: 'h6', name: 'Quốc khánh (nghỉ bù)', startDate: '03/09', endDate: '03/09', type: 'YEARLY' },
];

export default function HolidaySettingsPage() {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  // Delete Confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

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
      setHolidays((prev) => prev.filter((h) => h.id !== holidayToDelete.id));
    }
    setDeleteConfirmOpen(false);
    setHolidayToDelete(null);
  };

  const handleDialogSuccess = () => {
    // Basic mock update or API reload
    // setHolidays(...) 
  };

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
              <div className="relative w-40 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option value="ALL">Năm: Tất cả</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>

              <div className="relative w-48 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option value="ALL">Phân loại: Tất cả</option>
                  <option value="YEARLY">Hằng năm</option>
                  <option value="SPECIFIC_YEAR">Năm cụ thể</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>

              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm Tên ngày lễ..."
                  className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-secondary-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-800">
              Tìm kiếm
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4 w-12">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                  </th>
                  <th scope="col" className="px-5 py-4">Tên ngày lễ</th>
                  <th scope="col" className="px-5 py-4">Ngày bắt đầu</th>
                  <th scope="col" className="px-5 py-4">Ngày kết thúc</th>
                  <th scope="col" className="px-5 py-4">Phân loại</th>
                  <th scope="col" className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {holidays.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-secondary-400" />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-accent-600">
                      {item.startDate}
                    </td>
                    <td className="px-5 py-4 font-semibold text-accent-600">
                      {item.endDate}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          item.type === 'YEARLY'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        )}
                      >
                        {item.type === 'YEARLY' ? 'Lặp lại Hằng năm' : 'Theo năm Sự kiện'}
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
                ))}
                
                {holidays.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-secondary-500">
                      Chưa có ngày lễ nào được thiết lập.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={1}
              onPageChange={setCurrentPage}
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
