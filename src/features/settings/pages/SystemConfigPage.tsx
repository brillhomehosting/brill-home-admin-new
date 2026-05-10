import { useCallback, useEffect, useState } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button, Modal, Pagination } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { useSystemConfigs } from '../hooks/useSystemConfigs';
import {
  useCreateSystemConfig,
  useDeleteSystemConfig,
  useUpdateSystemConfig,
} from '../hooks/useSystemConfigMutations';
import { SystemConfigTable } from '../components/SystemConfigTable';
import { SystemConfigFormModal } from '../components/SystemConfigFormModal';
import type {
  SystemConfig,
  SystemConfigCreateRequest,
  SystemConfigUpdateRequest,
} from '@/shared/types';

export default function SystemConfigPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | undefined>();

  const [deleteTarget, setDeleteTarget] = useState<SystemConfig | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: pageData, isLoading } = useSystemConfigs({
    page,
    size,
    configKey: debouncedSearch || undefined,
  });

  const createMutation = useCreateSystemConfig();
  const updateMutation = useUpdateSystemConfig();
  const deleteMutation = useDeleteSystemConfig();

  const configs = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;

  const handleAdd = useCallback(() => {
    setEditingConfig(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((config: SystemConfig) => {
    setEditingConfig(config);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingConfig(undefined);
  }, []);

  const handleFormSubmit = useCallback(
    (payload: SystemConfigCreateRequest | SystemConfigUpdateRequest) => {
      if (editingConfig) {
        updateMutation.mutate(
          { id: editingConfig.id, data: payload as SystemConfigUpdateRequest },
          { onSuccess: handleFormClose },
        );
      } else {
        createMutation.mutate(payload as SystemConfigCreateRequest, {
          onSuccess: handleFormClose,
        });
      }
    },
    [editingConfig, updateMutation, createMutation, handleFormClose],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteMutation]);

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Cấu hình hệ thống"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Cấu hình hệ thống' },
        ]}
        actions={
          <Button
            icon={Plus}
            onClick={handleAdd}
            className="bg-primary-600 hover:bg-primary-700 shadow-sm h-10 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">Thêm cấu hình</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        }
      />

      <PageWrapper className="flex-1 space-y-6 min-w-0">
        {/* --- Filters Section --- */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex flex-col gap-1.5 w-full sm:max-w-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">
              Tìm kiếm theo key
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="VD: HOMESTAY_NAME..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm font-medium outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 !text-secondary-950"
              />
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden max-w-full">
          <div className="flex items-center justify-between sm:justify-end gap-3 px-1 sm:px-0 py-2 bg-surface/50">
            <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider px-3">
              Tổng số: {totalElements}
            </span>
          </div>

          <SystemConfigTable
            configs={configs}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />

          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
              summary={`Hiển thị ${configs.length} / ${totalElements} kết quả`}
            />
          </div>
        </div>
      </PageWrapper>

      {/* ── Create / Edit modal ── */}
      <SystemConfigFormModal
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        config={editingConfig}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Delete confirmation ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-danger-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold">Xác nhận xóa</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              className="bg-danger-500 text-white hover:bg-danger-600"
              onClick={handleDeleteConfirm}
              loading={deleteMutation.isPending}
            >
              Xóa xác nhận
            </Button>
          </>
        }
      >
        <p className="text-secondary-700 text-sm leading-relaxed">
          Bạn có chắc chắn muốn xóa cấu hình{' '}
          <strong className="text-foreground font-mono">
            {deleteTarget?.configKey}
          </strong>
          ?
          {deleteTarget?.isSystemDefined && (
            <>
              <br />
              <br />
              <span className="text-xs text-amber-600 font-medium">
                ⚠ Đây là cấu hình hệ thống, xóa có thể gây lỗi!
              </span>
            </>
          )}
        </p>
      </Modal>
    </div>
  );
}
