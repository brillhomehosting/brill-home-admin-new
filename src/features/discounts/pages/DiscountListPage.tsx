import { useState } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui';
import { Modal } from '@/shared/components/ui/Modal';
import { DiscountDialog } from '../components/DiscountDialog';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/utils';
import {
  Search,
  ChevronDown,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// --- Types & Mock Data ---

type DiscountType = 'ALL' | 'WEEK_DAY' | 'SLOT_TYPE' | 'ROOM_TYPE' | 'ROOM';
type ValueType = 'PERCENTAGE' | 'FIXED_AMOUNT';
type Status = 'ACTIVE' | 'INACTIVE';

type DiscountCampaign = {
  id: string;
  name: string;
  type: DiscountType;
  valueType: ValueType;
  value: number;
  startDate: string;
  endDate: string;
  target?: string;
  status: Status;
};

const mockDiscounts: DiscountCampaign[] = [
  {
    id: 'd1',
    name: 'Flash Sale 20/11',
    type: 'ALL',
    valueType: 'PERCENTAGE',
    value: 20,
    startDate: '19/11/2026',
    endDate: '21/11/2026',
    target: 'Tất cả booking',
    status: 'ACTIVE',
  },
  {
    id: 'd2',
    name: 'Weekend Surcharge Free',
    type: 'WEEK_DAY',
    valueType: 'PERCENTAGE',
    value: 10,
    startDate: '01/03/2026',
    endDate: '31/12/2026',
    target: 'Cuối tuần (T7-CN)',
    status: 'ACTIVE',
  },
  {
    id: 'd3',
    name: 'Night Owl 50k',
    type: 'SLOT_TYPE',
    valueType: 'FIXED_AMOUNT',
    value: 50000,
    startDate: '01/04/2026',
    endDate: '30/04/2026',
    target: 'Slot qua đêm',
    status: 'ACTIVE',
  },
  {
    id: 'd4',
    name: 'Mừng khai trương Cinema',
    type: 'ROOM',
    valueType: 'PERCENTAGE',
    value: 15,
    startDate: '01/01/2026',
    endDate: '31/01/2026',
    target: 'Phòng Cinema',
    status: 'INACTIVE', // Expired
  },
];

const typeStyles: Record<DiscountType, string> = {
  ALL: 'bg-info-50 text-indigo-700 border border-info-200 font-medium',
  WEEK_DAY: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
  SLOT_TYPE: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
  ROOM_TYPE: 'bg-pink-50 text-pink-700 border border-pink-200 font-medium',
  ROOM: 'bg-purple-50 text-purple-700 border border-purple-200 font-medium',
};

// --- Component ---

export default function DiscountListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const [discounts, setDiscounts] = useState<DiscountCampaign[]>(mockDiscounts);

  // Delete Confirm Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DiscountCampaign | null>(null);

  const handleCreate = () => {
    setSelectedCampaign(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (campaign: DiscountCampaign) => {
    setSelectedCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (campaign: DiscountCampaign) => {
    setCampaignToDelete(campaign);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    // API call handle soft delete
    setDeleteConfirmOpen(false);
    setCampaignToDelete(null);
  };

  const handleToggleStatus = (id: string, currentStatus: Status) => {
    // API Call patch status
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Chương trình giảm giá"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Chương trình giảm giá' },
        ]}
        actions={
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-500"
          >
            <Plus className="h-4 w-4" />
            Tạo chương trình
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        {/* Table Section */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
          
          {/* Filters */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative w-36 shrink-0">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Từ ngày"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
                <span className="text-secondary-400 font-medium">-</span>
                <div className="relative w-36 shrink-0">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Đến ngày"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="relative w-36 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option value="ALL">Tất cả loại</option>
                  <option value="ALL">ALL</option>
                  <option value="WEEK_DAY">WEEK_DAY</option>
                  <option value="SLOT_TYPE">SLOT_TYPE</option>
                  <option value="ROOM_TYPE">ROOM_TYPE</option>
                  <option value="ROOM">ROOM</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>

              <div className="relative w-40 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>

              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm Tên chương trình..."
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
                  <th scope="col" className="px-5 py-4">Tên chương trình</th>
                  <th scope="col" className="px-5 py-4">Loại</th>
                  <th scope="col" className="px-5 py-4">Kiểu giảm / Giá trị</th>
                  <th scope="col" className="px-5 py-4">Áp dụng cho</th>
                  <th scope="col" className="px-5 py-4">Thời hạn</th>
                  <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                  <th scope="col" className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {discounts.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-foreground">{item.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', typeStyles[item.type])}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-accent-600">
                        Giảm {item.valueType === 'PERCENTAGE' ? `${item.value}%` : `${item.value.toLocaleString()}đ`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-secondary-600">{item.target}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-sm text-secondary-600">
                        <span className="text-secondary-400 text-xs">Từ: <span className="text-secondary-600 font-medium">{item.startDate}</span></span>
                        <span className="text-secondary-400 text-xs">Đến: <span className="text-secondary-600 font-medium">{item.endDate}</span></span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          item.status === 'ACTIVE'
                            ? 'bg-success-100 text-success-700'
                            : 'bg-secondary-100 text-secondary-600'
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Button */}
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus:outline-none transition-colors duration-200 ease-in-out",
                            item.status === 'ACTIVE' ? 'bg-success-500' : 'bg-secondary-300'
                          )}
                          role="switch"
                          aria-checked={item.status === 'ACTIVE'}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              item.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                            )}
                          />
                        </button>
                        
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-secondary-400 hover:text-accent-500 hover:bg-accent-50 rounded transition-colors"
                          title="Sửa chương trình"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 text-secondary-400 hover:text-danger-500 hover:bg-danger-50 rounded transition-colors"
                          title="Xóa chương trình"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={2}
              onPageChange={setCurrentPage}
              summary="Hiển thị 4 / 15 kết quả"
            />
          </div>
        </div>
      </PageWrapper>

      {/* Create/Edit Form Dialog */}
      <DiscountDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialData={selectedCampaign}
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
            <Button className="bg-danger-500 text-white hover:bg-danger-600" onClick={executeDelete}>
              Xóa chương trình
            </Button>
          </>
        }
      >
        <p className="text-secondary-700 text-sm">
          Khoan đã Admin! Bạn có chắc chắn muốn xóa chương trình giảm giá <strong className="text-foreground">{campaignToDelete?.name}</strong> không? 
          <br /><br />
          <span className="text-xs text-secondary-500">
            *Lưu ý: Các booking đã tạo trước đó sẽ không bị ảnh hưởng.
          </span>
        </p>
      </Modal>

    </div>
  );
}
