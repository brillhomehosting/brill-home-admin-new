import { useCallback, useState } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
import { useComboConfigs } from '../hooks/useComboConfigs';
import {
  useToggleComboConfig,
  useUpdateComboConfig,
} from '../hooks/useComboConfigMutations';
import { ComboConfigTable } from '../components/ComboConfigTable';
import { ComboConfigFormModal } from '../components/ComboConfigFormModal';
import type { ComboConfig, ComboConfigUpdateRequest } from '@/shared/types';

export default function ComboConfigPage() {
  const { data: configs = [], isLoading } = useComboConfigs();

  const updateMutation = useUpdateComboConfig();
  const toggleMutation = useToggleComboConfig();

  const [editingConfig, setEditingConfig] = useState<ComboConfig | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleEdit = useCallback((config: ComboConfig) => {
    setEditingConfig(config);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingConfig(undefined);
  }, []);

  const handleFormSubmit = useCallback(
    (payload: ComboConfigUpdateRequest) => {
      if (!editingConfig) return;
      updateMutation.mutate(
        { id: editingConfig.id, data: payload },
        { onSuccess: handleFormClose },
      );
    },
    [editingConfig, updateMutation, handleFormClose],
  );

  const handleToggle = useCallback(
    (config: ComboConfig) => {
      setTogglingId(config.id);
      toggleMutation.mutate(config.id, {
        onSettled: () => setTogglingId(null),
      });
    },
    [toggleMutation],
  );

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Cấu hình combo"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Cấu hình combo' },
        ]}
      />

      <PageWrapper className="flex-1 space-y-6 min-w-0">
        {/* Info banner */}
        <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
          <p className="text-sm text-primary-700">
            Combo được áp dụng khi khách đặt nhiều slot liên tiếp. Mỗi combo có số slot tối thiểu cố định — chỉ có thể điều chỉnh mức giảm giá và trạng thái.
          </p>
        </div>

        {/* Table */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden max-w-full">
          <div className="flex items-center justify-end gap-3 px-1 sm:px-0 py-2 bg-surface/50">
            <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider px-3">
              Tổng số: {configs.length}
            </span>
          </div>

          <ComboConfigTable
            configs={configs}
            loading={isLoading}
            togglingId={togglingId}
            onEdit={handleEdit}
            onToggle={handleToggle}
          />
        </div>
      </PageWrapper>

      <ComboConfigFormModal
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        config={editingConfig}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
