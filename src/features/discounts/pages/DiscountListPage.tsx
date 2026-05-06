import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination, Select } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { ROUTES } from '@/shared/constants';
import type {
  DiscountCampaign,
  DiscountStatus,
  DiscountTargetType
} from '@/shared/types';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DiscountDialog } from '../components/DiscountDialog';
import { useDiscountMutations, useDiscounts } from '../hooks/useDiscounts';

// --- Styles mapping ---

const typeStyles: Record<DiscountTargetType, string> = {
  ALL: 'bg-info-50 text-indigo-700 border border-info-200 font-medium',
  WEEK_DAY: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
  SLOT_TYPE: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
  ROOM_TYPE: 'bg-pink-50 text-pink-700 border border-pink-200 font-medium',
  ROOM: 'bg-purple-50 text-purple-700 border border-purple-200 font-medium',
};

// --- Component ---

export default function DiscountListPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<DiscountStatus | undefined>(undefined);
  const [type, setType] = useState<DiscountTargetType | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<DiscountCampaign | null>(null);
  
  // Delete Confirm Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DiscountCampaign | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // API Hooks
  const { data: response, isLoading } = useDiscounts({
    page,
    size,
    name: debouncedSearch,
    status,
    type,
    startDate,
    endDate,
  });

  const { toggleStatus, remove } = useDiscountMutations();

  const discounts = response?.content || [];
  const totalElements = response?.totalElements || 0;
  const totalPages = response?.totalPages || 0;

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
    if (campaignToDelete) {
      remove.mutate(campaignToDelete.id, {
        onSettled: () => {
          setDeleteConfirmOpen(false);
          setCampaignToDelete(null);
        }
      });
    }
  };

  const handleToggleStatus = (campaign: DiscountCampaign) => {
    const nextStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatus.mutate({ id: campaign.id, status: nextStatus });
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Chương trình giảm giá"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Giảm giá' },
        ]}
        actions={
          <Button
            onClick={handleCreate}
            className="bg-accent-400 hover:bg-accent-500"
            icon={Plus}
          >
            Tạo chương trình
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        {/* Table Section */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-border p-3.5 bg-surface/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Date Filter */}
              <div className="flex items-center gap-2 lg:col-span-1">
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Từ"
                    value={startDate}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(0);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-8 pr-2 text-base sm:text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                  />
                </div>
                <span className="text-secondary-400 font-bold">-</span>
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Đến"
                    value={endDate}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(0);
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-8 pr-2 text-base sm:text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                  />
                </div>
              </div>

              {/* Group Type & Status in 2 columns on mobile */}
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <Select
                  value={type || ''}
                  onChange={(e) => {
                    setType((e.target.value as DiscountTargetType) || undefined);
                    setPage(0);
                  }}
                  options={[
                    { value: '', label: 'Loại' },
                    { value: 'ALL', label: 'Tất cả' },
                    { value: 'WEEK_DAY', label: 'Ngày tuần' },
                    { value: 'SLOT_TYPE', label: 'Khung giờ' },
                    { value: 'ROOM_TYPE', label: 'Loại phòng' },
                    { value: 'ROOM', label: 'Phòng' },
                  ]}
                  className="h-10"
                />

                <Select
                  value={status || ''}
                  onChange={(e) => {
                    setStatus((e.target.value as DiscountStatus) || undefined);
                    setPage(0);
                  }}
                  options={[
                    { value: '', label: 'Trạng thái' },
                    { value: 'ACTIVE', label: 'Đang bật' },
                    { value: 'INACTIVE', label: 'Đã tắt' },
                  ]}
                  className="h-10"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm Tên chương trình..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-base sm:text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-400">
                Tìm thấy {totalElements} chương trình
              </span>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4">Tên chương trình</th>
                  <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                  <th scope="col" className="px-5 py-4">Loại</th>
                  <th scope="col" className="px-5 py-4">Giảm giá</th>
                  <th scope="col" className="px-5 py-4">Phạm vi</th>
                  <th scope="col" className="px-5 py-4">Thời gian</th>
                  <th scope="col" className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-secondary-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-secondary-500 font-medium">
                      Chưa có chương trình giảm giá nào.
                    </td>
                  </tr>
                ) : (
                  discounts.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-foreground">{item.name}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            item.status === 'ACTIVE'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-secondary-100 text-secondary-600'
                          )}
                        >
                          {item.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold uppercase', typeStyles[item.type])}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-accent-600">
                          {item.discountType === 'PERCENTAGE' 
                            ? `${item.discountValue}%` 
                            : formatCurrency(item.discountValue)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-secondary-600">
                          {item.targetRoomName || 'Toàn hệ thống'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col text-xs text-secondary-600">
                          <span>Từ: <span className="text-secondary-600 font-medium">{formatDate(item.startDate)}</span></span>
                          <span>Đến: <span className="text-secondary-600 font-medium">{formatDate(item.endDate)}</span></span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={toggleStatus.isPending}
                            className={cn(
                              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus:outline-none transition-colors duration-200 ease-in-out",
                              item.status === 'ACTIVE' ? 'bg-success-500' : 'bg-secondary-300',
                              toggleStatus.isPending && "opacity-50 cursor-not-allowed"
                            )}
                            role="switch"
                            aria-checked={item.status === 'ACTIVE'}
                          >
                            {toggleStatus.isPending && toggleStatus.variables?.id === item.id ? (
                              <Loader2 className="absolute inset-x-0 mx-auto h-3 w-3 animate-spin text-white" />
                            ) : (
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                  item.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                                )}
                              />
                            )}
                          </button>
                          
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
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : discounts.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-secondary-500 text-sm">
                Chưa có chương trình giảm giá nào.
              </div>
            ) : (
              discounts.map((item) => (
                <div key={item.id} className="flex flex-col p-4 gap-3 bg-surface hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{item.name}</p>
                        <p className="text-[10px] text-secondary-400 font-medium">#{item.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                        item.status === 'ACTIVE' ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-600'
                      )}
                    >
                      {item.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-secondary-50 p-2 border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary-400">Loại & Giá trị</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase', typeStyles[item.type])}>
                          {item.type}
                        </span>
                        <span className="font-bold text-accent-600 text-sm">
                          {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : formatCurrency(item.discountValue)}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-secondary-50 p-2 border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary-400">Hiệu lực</p>
                      <p className="mt-1 text-[10px] font-medium text-secondary-600">
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        disabled={toggleStatus.isPending}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
                          item.status === 'ACTIVE' ? 'bg-success-500' : 'bg-secondary-300'
                        )}
                      >
                        <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition duration-200", item.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0')} />
                      </button>
                      <span className="text-xs font-medium text-secondary-500">
                        {item.status === 'ACTIVE' ? 'Đang bật' : 'Đang tắt'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" icon={Pencil} onClick={() => handleEdit(item)} />
                      <Button variant="ghost" size="sm" icon={Trash2} className="text-danger-500" onClick={() => handleDeleteClick(item)} />
                    </div>
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
              summary={`Hiển thị ${discounts.length} / ${totalElements} kết quả`}
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
            <Button className="bg-danger-500 text-white hover:bg-danger-600" onClick={executeDelete} loading={remove.isPending}>
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
