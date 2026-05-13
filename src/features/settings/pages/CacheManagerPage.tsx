import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Input } from '@/shared/components/ui/Input';
import { getCaches, getCacheStats, clearAllCaches, deleteCacheEntry, createCacheEntry, updateCacheEntry } from '@/shared/services/cache.service';
import type { CacheEntry } from '@/shared/services/cache.service';
import { Loader2, Trash2, Edit, Plus, RefreshCw, Database, Clock, Tag } from 'lucide-react';
import { useToast } from '@/shared/components/feedback/Toast';
import { cn } from '@/shared/utils';

export default function CacheManagerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pattern, setPattern] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CacheEntry | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['cache', 'stats'],
    queryFn: getCacheStats,
  });

  const { data: cachesData, isLoading: cachesLoading, refetch: refetchCaches } = useQuery({
    queryKey: ['cache', 'list', pattern],
    queryFn: () => getCaches({ size: 50, pattern: pattern || undefined }),
  });

  const clearMutation = useMutation({
    mutationFn: (p?: string) => clearAllCaches(p),
    onSuccess: () => {
      toast('Xóa cache thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
      setIsClearModalOpen(false);
    },
    onError: () => toast('Xóa cache thất bại', 'error'),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: deleteCacheEntry,
    onSuccess: () => {
      toast('Xóa entry thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
    },
    onError: () => toast('Xóa entry thất bại', 'error'),
  });

  const handleRefresh = () => {
    refetchStats();
    refetchCaches();
  };

  const entries: CacheEntry[] = cachesData?.content ?? [];

  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header title="Quản lý Cache" />

      <PageWrapper className="flex-1 space-y-6 pt-4 pb-10 px-4 sm:pt-6 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Tổng đối tượng" value={statsLoading ? '…' : stats?.total} color="primary" />
          <StatCard title="Object Cache" value={statsLoading ? '…' : stats?.objectCount} color="accent" />
          <StatCard title="Counter Cache" value={statsLoading ? '…' : stats?.counterCount} color="warning" />
          <StatCard title="Lock Cache" value={statsLoading ? '…' : stats?.lockCount} color="danger" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-surface p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Lọc pattern (vd: auth:*)..."
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleRefresh} className="shrink-0">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsClearModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Xóa nhiều
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          {cachesLoading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : !entries.length ? (
            <div className="p-10 text-center text-secondary-500 text-sm">Không tìm thấy cache nào.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-dim text-xs uppercase text-secondary-500 font-semibold tracking-wider border-b border-border">
                    <tr>
                      <th className="px-5 py-4">Key</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">TTL (s)</th>
                      <th className="px-5 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.map((entry) => (
                      <tr key={entry.key} className="hover:bg-secondary-50/50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs font-medium text-foreground max-w-xs truncate">
                          {entry.key}
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-secondary-100 text-secondary-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-secondary-600 text-xs font-medium">
                          {entry.remainingTtlSeconds > 0 ? `${entry.remainingTtlSeconds}s` : '∞ Vĩnh viễn'}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingEntry(entry); setIsEntryModalOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger-500"
                              onClick={() => { if (confirm('Chắc chắn xóa cache này?')) deleteEntryMutation.mutate(entry.key); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry.key} className="px-4 py-3 hover:bg-secondary-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-[11px] font-bold text-foreground break-all leading-tight flex-1">
                        {entry.key}
                      </p>
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => { setEditingEntry(entry); setIsEntryModalOpen(true); }}
                          className="p-2 text-secondary-400 hover:text-primary-600 active:scale-90 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Chắc chắn xóa cache này?')) deleteEntryMutation.mutate(entry.key); }}
                          className="p-2 text-secondary-400 hover:text-danger-500 active:scale-90 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                        "bg-secondary-100 text-secondary-600"
                      )}>
                        <Tag className="h-2.5 w-2.5" />
                        {entry.type}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-secondary-500">
                        <Clock className="h-2.5 w-2.5" />
                        {entry.remainingTtlSeconds > 0 ? `${entry.remainingTtlSeconds}s` : '∞ Vĩnh viễn'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PageWrapper>

      <ClearCacheModal
        open={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={(p) => clearMutation.mutate(p)}
        isLoading={clearMutation.isPending}
      />

      <EntryCacheModal
        open={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        entry={editingEntry}
      />
    </div>
  );
}

// ── Sub-components ──

type StatColor = 'primary' | 'accent' | 'warning' | 'danger';

function StatCard({ title, value, color }: { title: string; value: React.ReactNode; color: StatColor }) {
  const colorMap: Record<StatColor, string> = {
    primary: 'bg-primary-50 text-primary-600',
    accent:  'bg-accent-50 text-accent-600',
    warning: 'bg-warning-50 text-warning-600',
    danger:  'bg-danger-50 text-danger-600',
  };
  return (
    <div className="bg-surface border border-border p-3 sm:p-4 rounded-xl flex items-center gap-3 shadow-sm">
      <div className={cn('p-2 sm:p-3 rounded-lg shrink-0', colorMap[color])}>
        <Database className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] text-secondary-500 font-bold uppercase tracking-wider truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function ClearCacheModal({ open, onClose, onConfirm, isLoading }: {
  open: boolean; onClose: () => void; onConfirm: (pattern: string) => void; isLoading: boolean;
}) {
  const [pattern, setPattern] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Xóa nhiều Cache">
      <div className="space-y-4">
        <p className="text-sm text-secondary-500">Nhập pattern để xóa (để trống sẽ xóa toàn bộ cache).</p>
        <Input placeholder="Ví dụ: room:*" value={pattern} onChange={(e) => setPattern(e.target.value)} />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button variant="danger" onClick={() => onConfirm(pattern)} loading={isLoading}>Xác nhận xóa</Button>
        </div>
      </div>
    </Modal>
  );
}

function EntryCacheModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: CacheEntry | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState(0);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (entry) {
        return updateCacheEntry(entry.key, { value: JSON.parse(payload.value), ttlSeconds: payload.ttl });
      }
      return createCacheEntry({ fullKey: payload.key, value: JSON.parse(payload.value), ttlSeconds: payload.ttl });
    },
    onSuccess: () => {
      toast(entry ? 'Cập nhật thành công' : 'Thêm mới thành công', 'success');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
      onClose();
    },
    onError: () => toast('Có lỗi xảy ra, kiểm tra lại JSON', 'error'),
  });

  return (
    <Modal open={open} onClose={() => { setKey(''); setValue(''); setTtl(0); onClose(); }} title={entry ? 'Cập nhật Cache' : 'Thêm Cache'}>
      <div className="space-y-4">
        {!entry && (
          <div>
            <label className="text-sm font-medium mb-1 block">Key</label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
        )}
        <div>
          <label className="text-sm font-medium mb-1 block">Value (JSON)</label>
          <Textarea rows={6} value={value} onChange={(e) => setValue(e.target.value)} placeholder='{"prop": "value"}' />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">TTL Seconds (0 = Vĩnh viễn)</label>
          <Input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Hủy</Button>
          <Button variant="primary" onClick={() => mutation.mutate({ key, value, ttl })} loading={mutation.isPending}>Lưu Cache</Button>
        </div>
      </div>
    </Modal>
  );
}
